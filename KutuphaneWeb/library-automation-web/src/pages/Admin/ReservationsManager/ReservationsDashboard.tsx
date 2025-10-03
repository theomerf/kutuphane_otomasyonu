import { faArrowLeft, faClock, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { Link } from "react-router-dom";
import requests from "../../../services/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
                <p className="font-semibold text-4xl  text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Rezervasyon Yönetimi Dashboard</p>
                <Link to="/admin" className="ml-auto button font-bold text-lg self-center hover:scale-105 duration-500">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Geri
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-x-10 px-20 mt-5">
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <EventAvailableIcon style={{ color: "#4ade80", fontSize: "48px" }} />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{reservationsDashboardStats.reservationsCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Rezervasyon</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/reservations" className="button !bg-green-400 hover:scale-105 text-lg font-semibold duration-500">Rezervasyonları Yönet</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <EventSeatIcon style={{ color: "#60a5fa", fontSize: "48px" }} />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{reservationsDashboardStats.seatsCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Koltuk</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/seats" className="button !bg-blue-400 hover:scale-105 text-lg font-semibold duration-500">Koltukları Yönet</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faClock} className="text-red-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{reservationsDashboardStats.timeSlotsCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Zaman Aralığı</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/timeslots" className="button !bg-red-400 hover:scale-105 text-lg font-semibold duration-500">Zaman Aralıklarını Yönet</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}