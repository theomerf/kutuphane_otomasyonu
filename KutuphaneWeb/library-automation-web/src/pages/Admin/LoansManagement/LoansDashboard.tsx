import { faArrowLeft, faArrowRightArrowLeft, faBook, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import requests from "../../../services/api";
import { useEffect, useState } from "react";

interface LoansDashboardStats {
    loansCount: number;
    penaltiesCount: number;
}

export default function LoansDashboard() {
    const [loansDashboardStats, setLoansDashboardStats] = useState<LoansDashboardStats>({
        loansCount: 0,
        penaltiesCount: 0,
    });

    const fetchStats = async () => {
        try {
            const [loansRes] = await Promise.all([
                requests.loan.getAllLoansCount(),
            ]);

            setLoansDashboardStats({
                loansCount: loansRes.data,
                penaltiesCount: 0,
            });
        }
        catch (error) {
            console.error("Kiralam dashboard istatistikleri çekilirken hata oluştu:", error);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl  text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kiralama Yönetimi Dashboard</p>
                <Link to="/admin" className="ml-auto button font-bold text-lg self-center hover:scale-105 duration-500">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Geri
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-x-10 px-20 mt-5">
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faBook} className="text-green-400 text-5xl" />
                        <FontAwesomeIcon icon={faArrowRightArrowLeft} className="text-green-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{loansDashboardStats.loansCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Kiralama</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/loans" className="button !bg-green-400 hover:scale-105 text-lg font-semibold duration-500">Kiralamaları Yönet</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-blue-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{loansDashboardStats.penaltiesCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Ceza</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/categories" className="button !bg-blue-400 hover:scale-105 text-lg font-semibold duration-500">Cezaları Yönet</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}