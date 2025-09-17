import { HubConnectionBuilder, HubConnection, HubConnectionState, LogLevel } from "@microsoft/signalr";

class SignalRService {
    private connection: HubConnection | null = null;
    private connectionId: string | null = null;
    private currentGroup: string | null = null;
    private isConnecting: boolean = false;

    async startConnection(): Promise<void> {
        if (this.connection?.state === HubConnectionState.Connected) {
            return;
        }

        if (this.isConnecting) {
            return;
        }

        if (this.connection?.state === HubConnectionState.Disconnected) {
            this.connection = null;
        }

        this.isConnecting = true;

        try {
            this.connection = new HubConnectionBuilder()
                .withUrl("https://localhost:7214/reservationHub")
                .configureLogging(LogLevel.Error)
                .withAutomaticReconnect()
                .build();

            await this.connection.start();
            this.connectionId = this.connection.connectionId;
        }
        catch (err) {
            console.error("SignalR Connection Error: ", err);
        }
        finally {
            this.isConnecting = false;
        }
    }

    async joinDateTimeSlotGroup(reservationDate: string, timeSlotId: number): Promise<void> {
        if (this.connection) {
            if (this.currentGroup) {
                await this.leaveDateTimeSlotGroup();
            }

            await this.connection.invoke('JoinDateTimeSlotGroup', reservationDate, timeSlotId);
            this.currentGroup = `date_${reservationDate}_slot_${timeSlotId}`;
        }
    }

    async leaveDateTimeSlotGroup(): Promise<void> {
        if (this.connection && this.currentGroup) {
            const [, date, , timeSlotId] = this.currentGroup.split('_');
            await this.connection.invoke('LeaveDateTimeSlotGroup', date, parseInt(timeSlotId));
            this.currentGroup = null;
        }
    }

    async selectSeat(seatId: number, reservationDate: string, timeSlotId: number): Promise<void> {
        if (this.connection) {
            await this.connection.invoke("SelectSeat", seatId, reservationDate, timeSlotId);
        }
    }
    
    async releaseSeat(seatId: number, reservationDate: string, timeSlotId: number): Promise<void> {
        if (this.connection) {
            await this.connection.invoke("ReleaseSeat", seatId, reservationDate, timeSlotId);
        }
    }

    onSeatSelected(callback: (seatId: number, reservationDate: string, timeSlotId: number, connectionId: string) => void): void {
        this.connection?.on("SeatSelected", callback);
    }

    onSeatReleased(callback: (seatId: number, reservationDate: string, timeSlotId: number) => void): void {
        this.connection?.on("SeatReleased", callback);
    }

    onSeatReserved(callback: (seatId: number, reservationDate: string, timeSlotId: number) => void): void {
        this.connection?.on("SeatReserved", callback);
    }

    onSeatAlreadySelected(callback: (seatId: number) => void): void {
        this.connection?.on("SeatAlreadySelected", callback);
    }

    onSeatCancelled(callback: (seatId: number, reservationDate: string, timeSlotId: number) => void): void {
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
            await this.leaveDateTimeSlotGroup();
            await this.connection.stop();
            this.connection = null;
            this.connectionId = null;
        }
    }
}

export const signalRService = new SignalRService();



