import { useCallback, useEffect, useState } from "react";
import LibrarySeatMap from "../../components/library/LibrarySeatMap";
import type Seat from "../../types/seat";
import { groupSeatsByTable } from "../../utils/groupSeatsByTable"
import requests from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClock, faCalendarAlt, faChevronDown, faCalendarDays, faInfoCircle, faPlay, faStop, faXmark, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import type ReservationRequestParameters from "../../types/reservationRequestParameters";
import type TimeSlot from "../../types/timeSlot";
import type ReservationStatuses from "../../types/reservationStatuses";
import { formatTime } from "../../utils/formatTime";
import { getTodayFormatted, getTomorrowFormatted } from "../../utils/dateUtils";
import { toast } from "react-toastify";
import type ReservationResponse from "../../types/reservation";
import { signalRService } from "../../services/signalRService";
import { useBreakpoint } from "../../hooks/useBreakpoint";

type SeatInfo = {
    seatId: number;
    seatNumber: number;
    tableName: string;
}

export default function Reservation() {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<SeatInfo | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(getTodayFormatted());
    const [timeSlots, setTimeSlots] = useState<Map<string, TimeSlot[]>>(new Map());
    const [modalTimer, setModalTimer] = useState<number>(0);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [reservationsStatuses, setReservationsStatuses] = useState<ReservationStatuses[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const { up } = useBreakpoint();
    const tables = groupSeatsByTable(seats);

    const handleSeatSelected = useCallback((seatId: number, reservationDate: string, timeSlotId: number) => {
        setReservationsStatuses(prev => {
            const existingIndex = prev.findIndex(r =>
                r.seatId === seatId &&
                r.timeSlotId === timeSlotId &&
                r.reservationDate === reservationDate
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = { seatId, timeSlotId, reservationDate, status: "Temp" };
                return updated;
            } else {
                return [...prev, { seatId, timeSlotId, reservationDate, status: "Temp" }];
            }
        });
    }, []);

    const handleSeatReleased = useCallback((seatId: number, reservationDate: string, timeSlotId: number) => {
        setReservationsStatuses(prev =>
            prev.filter(r =>
                !(r.seatId === seatId &&
                    r.reservationDate === reservationDate &&
                    r.timeSlotId === timeSlotId)
            )
        );
    }, []);

    const handleSeatReserved = useCallback((seatId: number, reservationDate: string, timeSlotId: number) => {
        setReservationsStatuses(prev => {
            const existingIndex = prev.findIndex(r =>
                r.seatId === seatId &&
                r.timeSlotId === timeSlotId &&
                r.reservationDate === reservationDate
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = { seatId, timeSlotId, reservationDate, status: "Active" };
                return updated;
            } else {
                return [...prev, { seatId, timeSlotId, reservationDate, status: "Active" }];
            }
        });
    }, []);

    const handleSeatCancelled = useCallback((seatId: number, reservationDate: string, timeSlotId: number) => {
        setReservationsStatuses(prev =>
            prev.filter(r =>
                !(r.seatId === seatId &&
                    r.reservationDate === reservationDate &&
                    r.timeSlotId === timeSlotId)
            )
        );
    }, []);

    const handleSeatAlreadySelected = useCallback((seatId: number) => {
        toast.error(`Koltuk ${seatId} başka bir kullanıcı tarafından seçilmiş!`);
    }, []);

    useEffect(() => {
        signalRService.startConnection();

        signalRService.onSeatSelected(handleSeatSelected);
        signalRService.onSeatReleased(handleSeatReleased);
        signalRService.onSeatReserved(handleSeatReserved);
        signalRService.onSeatCancelled(handleSeatCancelled);
        signalRService.onSeatAlreadySelected(handleSeatAlreadySelected);

        return () => {
            signalRService.stopConnection();
        };
    }, [handleSeatSelected, handleSeatReleased, handleSeatReserved, handleSeatCancelled, handleSeatAlreadySelected]);

    useEffect(() => {
        if (selectedDate && selectedTimeSlot) {
            signalRService.joinDateTimeSlotGroup(selectedDate, selectedTimeSlot.id!);
        }
    }, [selectedDate, selectedTimeSlot]);

    async function fetchReservationsStatuses(queryParams: ReservationRequestParameters, signal?: AbortSignal) {
        const queryString = new URLSearchParams();

        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryString.append(key, value.toString());
            }
        });

        const result = await requests.reservation.getAllReservationsStatuses(queryString, signal);
        setReservationsStatuses(result.data as ReservationStatuses[]);
    }

    useEffect(() => {
        async function fetchSeats() {
            const result = await requests.seats.getAllSeats();
            setSeats(result.data as Seat[]);
        }

        async function fetchTimeSlots() {
            try {
                const result = await requests.timeSlots.getAllTimeSlots();
                const newTimeSlots = new Map<string, TimeSlot[]>();

                const todayKey = getTodayFormatted();
                const tomorrowKey = getTomorrowFormatted();
                const now = new Date();

                result.data.forEach((timeSlot: TimeSlot) => {
                    if (!newTimeSlots.has(tomorrowKey)) {
                        newTimeSlots.set(tomorrowKey, []);
                    }
                    newTimeSlots.get(tomorrowKey)!.push(timeSlot);

                    const timeSlotEndTime = new Date(`${todayKey}T${timeSlot.endTime}`);
                    if (timeSlotEndTime > now) {
                        if (!newTimeSlots.has(todayKey)) {
                            newTimeSlots.set(todayKey, []);
                        }
                        newTimeSlots.get(todayKey)!.push(timeSlot);
                    }
                });

                setTimeSlots(newTimeSlots);

                const firstAvailableSlot = newTimeSlots.get(todayKey)?.[0] ||
                    newTimeSlots.get(tomorrowKey)?.[0];

                if (firstAvailableSlot) {
                    setSelectedTimeSlot(firstAvailableSlot);
                }

            } catch (error) {
                console.error('Time slots fetch error:', error);
            }
        }

        fetchSeats();
        fetchTimeSlots();
        fetchReservationsStatuses({ date: selectedDate?.toString(), timeSlotId: selectedTimeSlot?.id });
    }, []);

    useEffect(() => {
        let timer: number;

        if (showModal && selectedSeat) {
            setModalTimer(60);

            timer = setInterval(() => {
                setModalTimer(prev => {
                    if (prev <= 1) {
                        setShowModal(false);
                        setSelectedSeat(null);
                        toast.warning("Koltuk seçimi zaman aşımına uğradı.");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [showModal, selectedSeat]);

    const handleSelectSeat = async (seatId: number, seatNumber: number, tableName: string) => {
        await signalRService.selectSeat(seatId, selectedDate!, selectedTimeSlot?.id!);

        setSelectedSeat({
            seatId,
            seatNumber,
            tableName
        });
        setShowModal(true);
    }

    const handleCreateReservation = async () => {
        try {
            const config = {
                headers: {
                    'X-SignalR-ConnectionId': signalRService.getConnectionId()
                }
            };
            const newReservation: ReservationResponse = {
                seatId: selectedSeat?.seatId!,
                reservationDate: selectedDate!,
                timeSlotId: selectedTimeSlot?.id!,
            }

            await requests.reservation.createReservation(newReservation, config);

            setShowModal(false);
            setSelectedSeat(null);
            setModalTimer(0);
            toast.success("Randevu başarıyla oluşturuldu.");
        } catch (error) {
            toast.error("Randevu oluşturulamadı. Lütfen tekrar deneyiniz.");
        }
    };

    useEffect(() => {
        if (selectedDate && selectedTimeSlot) {
            signalRService.joinDateTimeSlotGroup(selectedDate, selectedTimeSlot.id!);
        }
        fetchReservationsStatuses({ date: selectedDate?.toString(), timeSlotId: selectedTimeSlot?.id! });

    }, [selectedDate, selectedTimeSlot]);

    return (
        <>
            <div className="flex flex-col ">
                <p className="font-semibold text-4xl ml-5 lg:ml-20 text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Rezervasyon</p>

                <div className="px-5 lg:px-20 flex flex-col gap-y-8">
                    {(up.lg || isMobileFiltersOpen) ?
                        (
                            <div className="fixed left-0 z-10 lg:z-0 lg:static flex flex-col lg:flex-row w-fit xl:w-3/5 justify-center items-center gap-4 lg:gap-6 self-center shadow-xl lg:p-5 pb-6 rounded-br-lg lg:rounded-xl bg-white/95 backdrop-blur-sm border border-white/20">
                                <div className="bg-violet-400 lg:bg-white flex items-center py-6 px-6 lg:p-6 rounded-tr-lg lg:rounded-tr-none gap-3">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-white lg:text-violet-500 text-lg" />
                                    <p className="font-bold lg:text-lg text-white lg:text-gray-600">Rezervasyon Filtreleri</p>
                                    {!up.lg && isMobileFiltersOpen && <button onClick={() => setIsMobileFiltersOpen(false)} className="bg-red-600 rounded-full w-8 h-8 ml-2 text-white py-1 px-2">X</button>}
                                </div>

                                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full px-2 lg:w-auto">
                                    <div className="relative flex-1 lg:min-w-[200px]">
                                        <label htmlFor="dateSelect" className="block text-sm font-medium text-gray-600 mb-2">
                                            <FontAwesomeIcon icon={faCalendarDays} className="mr-2 text-violet-500" />
                                            Tarih
                                        </label>
                                        <select id="dateSelect" className="w-full py-3 px-4 pr-10 border-2 border-gray-200 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 appearance-none text-gray-700 font-semibold hover:border-violet-300" value={selectedDate!} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTimeSlot(timeSlots.get(e.target.value)?.[0] || null); }}>
                                            <option value={getTodayFormatted()}>Bugün</option>
                                            <option value={getTomorrowFormatted()}>Yarın</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-3 top-8 flex items-center text-gray-400">
                                            <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="relative flex-1 lg:min-w-[250px]">
                                        <label htmlFor="timeSlotSelect" className="block text-sm font-medium text-gray-600 mb-2">
                                            <FontAwesomeIcon icon={faClock} className="mr-2 text-violet-500" />
                                            Zaman Aralığı
                                        </label>
                                        <select id="timeSlotSelect" className="w-full py-3 px-4 pr-10 border-2 border-gray-200 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 appearance-none text-gray-700 font-semibold hover:border-violet-300" value={selectedTimeSlot?.id!} onChange={(e) => setSelectedTimeSlot(timeSlots.get(getTomorrowFormatted())?.find(t => t.id === parseInt(e.target.value)) || null)}>
                                            {selectedDate === getTomorrowFormatted() ? (
                                                timeSlots.get(getTomorrowFormatted())?.map(timeSlot => (
                                                    <option key={timeSlot.id} value={timeSlot.id}>
                                                        {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                                                    </option>
                                                )) || []
                                            ) : (
                                                timeSlots.get(getTodayFormatted())?.map(timeSlot => (
                                                    <option key={timeSlot.id} value={timeSlot.id}>
                                                        {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                                                    </option>
                                                )) || []
                                            )}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-3 top-8 flex items-center text-gray-400">
                                            <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                        : (
                            <button className="absolute left-0 p-1 bg-violet-500 text-xl font-semibold text-white rounded-tr-lg rounded-br-lg" onClick={() => setIsMobileFiltersOpen(true)}>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                            </button>
                        )
                    }

                    <div className="rounded-lg bg-white border shadow-violet-200 border-violet-400 shadow-xl">
                        <LibrarySeatMap tables={tables} reservationsStatuses={reservationsStatuses} selectedSeatId={selectedSeat?.seatId!} onSelectSeat={handleSelectSeat} />
                    </div>
                </div>

                {showModal &&
                    <div className="fixed px-5 lg:px-0 inset-0 lg:inset-0 mt-20 overflow-auto lg:mt-20 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="flex flex-col bg-white rounded-3xl shadow-lg">
                            <div className="bg-violet-400 py-2 lg:py-4 flex flex-col text-center gap-y-1 px-10 lg:px-32 rounded-tr-3xl rounded-tl-3xl">
                                <p className="font-bold text-lg lg:text-xl text-white">RANDEVU</p>
                                <p className="font-semibold lg:text-lg text-white">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                    {selectedSeat?.tableName} - Koltuk: {selectedSeat?.seatNumber}
                                </p>
                            </div>
                            <div>
                                <div className="flex flex-row gap-x-4 px-10 mt-6">
                                    <p className="font-bold mr-auto text-gray-500">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-violet-400" />
                                        Randevu Tarihi:
                                    </p>
                                    <p className="font-semibold ml-auto text-sm lg:text-base text-gray-500">{selectedDate}</p>
                                </div>
                                <div className="flex flex-row gap-x-4 px-10 mt-3">
                                    <p className="font-bold mr-auto text-gray-500">
                                        <FontAwesomeIcon icon={faPlay} className="mr-1 text-violet-400" />
                                        Randevu Başlangıç Saati:
                                    </p>
                                    <p className="font-semibold ml-auto text-sm lg:text-base text-gray-500">{formatTime(selectedTimeSlot?.startTime!)}</p>
                                </div>
                                <div className="flex flex-row gap-x-4 px-10 mt-3">
                                    <p className="font-bold mr-auto text-gray-500">
                                        <FontAwesomeIcon icon={faClock} className="mr-1 text-violet-400" />
                                        Randevu Süresi:
                                    </p>
                                    <p className="font-semibold ml-auto text-sm lg:text-base text-gray-500">3 Saat</p>
                                </div>
                                <div className="flex flex-row gap-x-4 px-10 mt-3">
                                    <p className="font-bold mr-auto text-gray-500">
                                        <FontAwesomeIcon icon={faStop} className="mr-1 text-violet-400" />
                                        Randevu Bitiş Saati:
                                    </p>
                                    <p className="font-semibold ml-auto text-sm lg:text-base text-gray-500">{formatTime(selectedTimeSlot?.endTime!)}</p>
                                </div>
                                <div className="text-sm text-gray-500 px-4 mt-10">
                                    <p>* Gelinmeyen randevular ceza puanı olarak yansır.</p>
                                    <p>* Randevuya gelemeyecekseniz iptal ediniz.</p>
                                    <p>* Randevuya 20 dakika geç kalınması durumunda <br />randevu iptal edilir.</p>
                                    <p>* Lütfen başkasının yerine randevu almayınız.</p>
                                </div>
                                <div className="mt-6 flex flex-row justify-center">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-yellow-500 self-center text-xl animate-pulse mr-2" />
                                    <p className="font-semibold text-base text-center lg:text-lg self-center text-gray-500">Randevuyu onaylamak için {modalTimer} saniyeniz kaldı.</p>
                                </div>
                                <div className="flex content-center justify-center gap-x-4 mt-6 mb-6">
                                    <button onClick={() => handleCreateReservation()} className="smallButton text-sm lg:button font-semibold lg:hover:scale-105">
                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                        Randevuyu Onayla
                                    </button>
                                    <button onClick={() => {
                                        setShowModal(false);
                                        setSelectedSeat(null);
                                        setModalTimer(0);
                                        signalRService.releaseSeat(selectedSeat?.seatId!, selectedDate!, selectedTimeSlot?.id!);
                                    }} className="smallButton text-sm lg:button font-semibold bg-red-500 lg:hover:scale-105">
                                        <FontAwesomeIcon icon={faXmark} className="mr-2" />
                                        İşlemi İptal Et
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>

    )
}