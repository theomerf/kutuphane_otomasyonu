import { HubConnectionBuilder, HubConnection, HubConnectionState, LogLevel } from "@microsoft/signalr";

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://localhost:7214';

class SignalRService {
    private connection: HubConnection | null = null;
    private connectionId: string | null = null;
    private currentGroup: string | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 3;
    private connectionStartPromise: Promise<void> | null = null;

    async startConnection(): Promise<void> {
        if (this.connectionStartPromise) {
            return this.connectionStartPromise;
        }

        if (this.connection?.state === HubConnectionState.Connected) {
            return Promise.resolve();
        }

        if (this.connection?.state === HubConnectionState.Connecting) {
            return new Promise((resolve, reject) => {
                const checkConnection = () => {
                    if (this.connection?.state === HubConnectionState.Connected) {
                        resolve();
                    } else if (this.connection?.state === HubConnectionState.Disconnected) {
                        reject(new Error("Connection failed"));
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
            });
        }

        this.connectionStartPromise = this.createConnection();
        
        try {
            await this.connectionStartPromise;
        } finally {
            this.connectionStartPromise = null;
        }
    }

    private async createConnection(): Promise<void> {
        try {
            if (this.connection) {
                await this.stopConnection();
            }

            this.connection = new HubConnectionBuilder()
                .withUrl(`${apiBase}/reservationHub`, {
                    withCredentials: false,
                    skipNegotiation: false
                })
                .configureLogging(LogLevel.Warning)
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        if (retryContext.previousRetryCount < 3) {
                            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                        }
                        return null;
                    }
                })
                .build();

            this.connection.onreconnecting(() => {
                console.log("SignalR reconnecting...");
            });

            this.connection.onreconnected(() => {
                this.connectionId = this.connection?.connectionId || null;
                
                if (this.currentGroup) {
                    this.rejoinCurrentGroup();
                }
            });

            this.connection.onclose((error) => {
                this.connectionId = null;
                this.currentGroup = null;
            });

            await this.connection.start();
            this.connectionId = this.connection.connectionId || null;
            this.reconnectAttempts = 0;

        } catch (error) {
            console.error("SignalR Connection Error: ", error);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                console.log(`Retrying connection... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                await new Promise(resolve => setTimeout(resolve, 2000 * this.reconnectAttempts));
                return this.createConnection();
            } else {
                throw new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`);
            }
        }
    }

    private async rejoinCurrentGroup(): Promise<void> {
        if (this.currentGroup && this.connection?.state === HubConnectionState.Connected) {
            try {
                const [, date, , timeSlotId] = this.currentGroup.split('_');
                await this.connection.invoke('JoinDateTimeSlotGroup', date, parseInt(timeSlotId));
            } catch (error) {
                console.error("Failed to rejoin group:", error);
            }
        }
    }

    async joinDateTimeSlotGroup(reservationDate: string, timeSlotId: number): Promise<void> {
        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            console.warn("Cannot join group: SignalR not connected");
            return;
        }

        try {
            if (this.currentGroup) {
                await this.leaveDateTimeSlotGroup();
            }

            await this.connection.invoke('JoinDateTimeSlotGroup', reservationDate, timeSlotId);
            this.currentGroup = `date_${reservationDate}_slot_${timeSlotId}`;
        } catch (error) {
            console.error("Failed to join group:", error);
        }
    }

    async leaveDateTimeSlotGroup(): Promise<void> {
        if (!this.connection || !this.currentGroup) {
            return;
        }

        try {
            const [, date, , timeSlotId] = this.currentGroup.split('_');
            await this.connection.invoke('LeaveDateTimeSlotGroup', date, parseInt(timeSlotId));
            this.currentGroup = null;
        } catch (error) {
            console.error("Failed to leave group:", error);
            this.currentGroup = null;
        }
    }

    async selectSeat(seatId: number, reservationDate: string, timeSlotId: number): Promise<void> {
        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            throw new Error("SignalR connection not available");
        }

        try {
            await this.connection.invoke("SelectSeat", seatId, reservationDate, timeSlotId);
        } catch (error) {
            console.error("Failed to select seat:", error);
            throw error;
        }
    }
    
    async releaseSeat(seatId: number, reservationDate: string, timeSlotId: number): Promise<void> {
        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            console.warn("Cannot release seat: SignalR not connected");
            return;
        }

        try {
            await this.connection.invoke("ReleaseSeat", seatId, reservationDate, timeSlotId);
        } catch (error) {
            console.error("Failed to release seat:", error);
        }
    }

    onSeatSelected(callback: (seatId: number, reservationDate: string, timeSlotId: number, connectionId: string) => void): void {
        this.connection?.off("SeatSelected");
        this.connection?.on("SeatSelected", callback);
    }

    onSeatReleased(callback: (seatId: number, reservationDate: string, timeSlotId: number) => void): void {
        this.connection?.off("SeatReleased");
        this.connection?.on("SeatReleased", callback);
    }

    onSeatReserved(callback: (seatId: number, reservationDate: string, timeSlotId: number) => void): void {
        this.connection?.off("SeatReserved");
        this.connection?.on("SeatReserved", callback);
    }

    onSeatAlreadySelected(callback: (seatId: number) => void): void {
        this.connection?.off("SeatAlreadySelected");
        this.connection?.on("SeatAlreadySelected", callback);
    }

    onSeatCancelled(callback: (seatId: number, reservationDate: string, timeSlotId: number) => void): void {
        this.connection?.off("SeatCancelled");
        this.connection?.on("SeatCancelled", callback);
    }

    getConnectionId(): string | null {
        return this.connectionId;
    }

    isConnected(): boolean {
        return this.connection?.state === HubConnectionState.Connected;
    }

    async stopConnection(): Promise<void> {
        if (this.connection) {
            try {
                this.connection.off("SeatSelected");
                this.connection.off("SeatReleased");
                this.connection.off("SeatReserved");
                this.connection.off("SeatAlreadySelected");
                this.connection.off("SeatCancelled");

                if (this.currentGroup) {
                    await this.leaveDateTimeSlotGroup();
                }

                await this.connection.stop();
            } catch (error) {
                console.error("Error stopping SignalR connection:", error);
            } finally {
                this.connection = null;
                this.connectionId = null;
                this.currentGroup = null;
                this.connectionStartPromise = null;
            }
        }
    }
}

export const signalRService = new SignalRService();