import { faArrowLeft, faClock, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { Link } from "react-router-dom";
import requests from "../../../services/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useBreakpoint } from "../../../hooks/useBreakpoint";

interface ReservationsDashboardStats {
    reservationsCount: number;
    seatsCount: number;
    timeSlotsCount: number;
}

export default function ReservationsDashboard() {
    const [reservationsDashboardStats, setReservationsDashboardStats] = useState<ReservationsDashboardStats>({
        reservationsCount: 0,
        seatsCount: 0,
        timeSlotsCount: 0,
    });
    const { up } = useBreakpoint();
    const isMobile = !up.md;

    const fetchStats = async (signal: AbortSignal) => {
        try {
            const [reservationsRes, seatsRes, timeSlotsRes,] = await Promise.all([
                requests.reservation.getActiveReservationsCount(signal),
                requests.seats.getAllSeatsCount(signal),
                requests.timeSlots.getAllTimeSlotsCount(signal),
            ]);

            setReservationsDashboardStats({
                reservationsCount: reservationsRes.data,
                seatsCount: seatsRes.data,
                timeSlotsCount: timeSlotsRes.data,
            });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                toast.error("Rezervasyon dashboard istatistikleri çekilirken hata oluştu.");
                console.error("Rezervasyon dashboard istatistikleri çekilirken hata oluştu:", error);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchStats(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-6 md:mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Rezervasyon Yönetimi Dashboard</p>
                <Link to="/admin" className="flex flex-row ml-auto button font-bold text-sm lg:text-lg self-center hover:scale-105 duration-500">
                    <FontAwesomeIcon icon={faArrowLeft} className="self-center mr-2" />
                    Geri
                </Link>
            </div>

            <div className={`grid gap-y-3 md:gap-y-4 gap-x-4 md:gap-x-6 lg:gap-x-10 px-4 md:px-10 lg:px-20 mt-8 md:mt-16 ${isMobile ? 'grid-cols-2' : 'lg:grid-cols-4 md:grid-cols-2'}`}>
                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <EventAvailableIcon style={{ color: "#4ade80", fontSize: isMobile ? "32px" : "48px" }} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>{reservationsDashboardStats.reservationsCount}</p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>Rezervasyon</p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/reservations" className={`button !bg-green-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Rezervasyonları Yönet'}
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <EventSeatIcon style={{ color: "#60a5fa", fontSize: isMobile ? "32px" : "48px" }} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {reservationsDashboardStats.seatsCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Koltuk
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/seats" className={`button !bg-blue-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Koltukları Yönet'}
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faClock} className={`text-red-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {reservationsDashboardStats.timeSlotsCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Zaman Aralığı
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/timeslots" className={`button !bg-red-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Zaman Aralıklarını Yönet'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}