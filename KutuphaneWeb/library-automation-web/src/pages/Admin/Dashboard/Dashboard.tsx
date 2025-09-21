import { faBook, faLayerGroup, faUser } from "@fortawesome/free-solid-svg-icons";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import requests from "../../../services/api";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [booksCount, setBooksCount] = useState<number>(0);
    const fetchStats = async () => {
        try {
            const response = await requests.books.countBooks();
            setBooksCount(response.data as number);
        }
        catch (error) {
            console.error("Error fetching book count:", error);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="flex flex-col">
            <p className="font-semibold text-4xl ml-8 lg:ml-20 text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Admin Paneli Dashboard</p>
            <div className="grid grid-cols-4 gap-x-10 px-20 mt-5">
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faBook} className="text-green-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{booksCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Kitap</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/books" className="button !bg-green-400 hover:scale-105 text-lg font-semibold duration-500">Kitapları Yönet</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faUser} className="text-red-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">20</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Kullanıcı</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/books" className="button !bg-red-400 hover:scale-105 text-lg font-semibold duration-500">Kullanıcıları Yönet</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faLayerGroup} className="text-blue-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">15</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Kategori</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/books" className="button !bg-blue-400 hover:scale-105 text-lg font-semibold duration-500">Kategorileri Yönet</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <EventAvailableIcon style={{ color: "#fb923c", fontSize: "48px" }} />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">50</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Rezervasyon</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/books" className="button !bg-orange-400 hover:scale-105 text-lg font-semibold duration-500">Rezervasyonları Yönet</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}