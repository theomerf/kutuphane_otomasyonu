import { faArrowRightArrowLeft, faBook, faUser } from "@fortawesome/free-solid-svg-icons";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import requests from "../../../services/api";
import { useEffect, useState } from "react";
import DashboardGraphs from "../../../components/dashboard/DashboardGraphs";
import { useBreakpoint } from "../../../hooks/useBreakpoint";

interface DashboardStats {
    booksCount: number;
    accountsCount: number;
    reservationsCount: number;
    loansCount: number;
}

export default function Dashboard() {
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        booksCount: 0,
        accountsCount: 0,
        reservationsCount: 0,
        loansCount: 0
    });
    const { up } = useBreakpoint();
    const isMobile = !up.md;

    const fetchStats = async (signal: AbortSignal) => {
        try {
            const [booksRes, accountsRes, reservationsRes, loanRes] = await Promise.all([
                requests.books.countBooks(signal),
                requests.account.countAccounts(signal),
                requests.reservation.getActiveReservationsCount(signal),
                requests.loan.getAllLoansCount(signal),
            ]);

            setDashboardStats({
                booksCount: booksRes.data,
                accountsCount: accountsRes.data,
                reservationsCount: reservationsRes.data,
                loansCount: loanRes.data
            });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                console.error("Error fetching book count:", error);
            }
        }
    }

    useEffect(() => {
        const controller = new AbortController();

        fetchStats(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <div className="flex flex-col pb-8">
            <p className="font-semibold text-2xl md:text-4xl ml-4 md:ml-8 lg:ml-20 text-violet-500 h-fit border-none pb-2 mb-6 md:mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">
                Admin Paneli Dashboard
            </p>

            <DashboardGraphs />

            <div className={`grid gap-y-3 md:gap-y-4 gap-x-4 md:gap-x-6 lg:gap-x-10 px-4 md:px-10 lg:px-20 mt-8 md:mt-16 ${isMobile ? 'grid-cols-2' : 'lg:grid-cols-4 md:grid-cols-2'}`}>
                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faBook} className={`text-green-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {dashboardStats.booksCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Kitap
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/dashboard/books" className={`button !bg-green-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Kitapları Yönet'}
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faUser} className={`text-blue-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {dashboardStats.accountsCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Kullanıcı
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/accounts" className={`button !bg-blue-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Kullanıcıları Yönet'}
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <EventAvailableIcon style={{ color: "#f87171", fontSize: isMobile ? "32px" : "48px" }} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {dashboardStats.reservationsCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Rezervasyon
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/dashboard/reservations" className={`button !bg-red-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Rezervasyonları Yönet'}
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faBook} className={`text-orange-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                        <FontAwesomeIcon icon={faArrowRightArrowLeft} className={`text-orange-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {dashboardStats.loansCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Kiralama
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/dashboard/loans" className={`button !bg-orange-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Kiralamaları Yönet'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}