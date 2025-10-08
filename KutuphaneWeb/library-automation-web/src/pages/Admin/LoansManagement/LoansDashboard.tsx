import { faArrowLeft, faArrowRightArrowLeft, faBook, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import requests from "../../../services/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useBreakpoint } from "../../../hooks/useBreakpoint";

interface LoansDashboardStats {
    loansCount: number;
    penaltiesCount: number;
}

export default function LoansDashboard() {
    const [loansDashboardStats, setLoansDashboardStats] = useState<LoansDashboardStats>({
        loansCount: 0,
        penaltiesCount: 0,
    });
    const { up } = useBreakpoint();
    const isMobile = !up.md;

    const fetchStats = async (signal: AbortSignal) => {
        try {
            const [loansRes, penaltiesRes] = await Promise.all([
                requests.loan.getAllLoansCount(signal),
                requests.penalty.countPenalties(signal)
            ]);

            setLoansDashboardStats({
                loansCount: loansRes.data,
                penaltiesCount: penaltiesRes.data,
            });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                toast.error("Kiralama dashboard istatistikleri çekilirken hata oluştu.");
                console.error("Kiralama dashboard istatistikleri çekilirken hata oluştu:", error);
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
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-6 md:mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kiralama Yönetimi Dashboard</p>
                <Link to="/admin" className="flex flex-row ml-auto button font-bold text-sm lg:text-lg self-center hover:scale-105 duration-500">
                    <FontAwesomeIcon icon={faArrowLeft} className="self-center mr-2" />
                    Geri
                </Link>
            </div>

            <div className={`grid gap-y-3 md:gap-y-4 gap-x-4 md:gap-x-6 lg:gap-x-10 px-4 md:px-10 lg:px-20 mt-8 md:mt-16 ${isMobile ? 'grid-cols-2' : 'lg:grid-cols-4 md:grid-cols-2'}`}>
                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faBook} className={`text-green-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                        <FontAwesomeIcon icon={faArrowRightArrowLeft} className={`text-green-400 ${isMobile ? 'text-2xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {loansDashboardStats.loansCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Kiralama
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/loans" className={`button !bg-green-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Kiralamaları Yönet'}
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className={`text-blue-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {loansDashboardStats.penaltiesCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Ceza
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/penalties" className={`button !bg-blue-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Cezaları Yönet'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}