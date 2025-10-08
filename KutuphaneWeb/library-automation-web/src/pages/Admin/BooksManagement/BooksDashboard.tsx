import { faArrowLeft, faBook, faLayerGroup, faPen, faTags } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import requests from "../../../services/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useBreakpoint } from "../../../hooks/useBreakpoint";

interface BooksDashboardStats {
    booksCount: number;
    categoriesCount: number;
    authorsCount: number;
    tagsCount: number;
}

export default function BooksDashboard() {
    const [booksDashboardStats, setBooksDashboardStats] = useState<BooksDashboardStats>({
        booksCount: 0,
        categoriesCount: 0,
        authorsCount: 0,
        tagsCount: 0
    });
    const { up } = useBreakpoint();
    const isMobile = !up.md;

    const fetchStats = async (signal: AbortSignal) => {
        try {
            const [booksRes, categoriesRes, authorsRes, tagsRes] = await Promise.all([
                requests.books.countBooks(signal),
                requests.categories.countCategories(signal),
                requests.authors.countAuthors(signal),
                requests.tags.countTags(signal),
            ]);

            setBooksDashboardStats({
                booksCount: booksRes.data,
                categoriesCount: categoriesRes.data,
                authorsCount: authorsRes.data,
                tagsCount: tagsRes.data
            });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                console.error("Kitap dashboard istatistikleri çekilirken hata oluştu:", error);
                toast.error("Kitap dashboard istatistikleri yüklenirken bir hata oluştu.");
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
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-6 md:mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kitap Yönetimi Dashboard</p>
                <Link to="/admin" className="flex flex-row ml-auto button font-bold text-sm lg:text-lg self-center hover:scale-105 duration-500">
                    <FontAwesomeIcon icon={faArrowLeft} className="self-center mr-2" />
                    Geri
                </Link>
            </div>

            <div className={`grid gap-y-3 md:gap-y-4 gap-x-4 md:gap-x-6 lg:gap-x-10 px-4 md:px-10 lg:px-20 mt-8 md:mt-16 ${isMobile ? 'grid-cols-2' : 'lg:grid-cols-4 md:grid-cols-2'}`}>
                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faBook} className={`text-green-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>{booksDashboardStats.booksCount}</p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>Kitap</p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/books" className={`button !bg-green-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Kitapları Yönet'}
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faLayerGroup} className={`text-blue-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {booksDashboardStats.categoriesCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Kategori
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/categories" className={`button !bg-blue-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Kategorileri Yönet'}
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faPen} className={`text-red-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {booksDashboardStats.authorsCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Yazar
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/authors" className={`button !bg-red-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Yazarları Yönet'}
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-y-2 md:gap-y-4 rounded-lg shadow-xl bg-white py-4 md:py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center">
                        <FontAwesomeIcon icon={faTags} className={`text-orange-400 ${isMobile ? 'text-3xl' : 'text-5xl'}`} />
                    </p>
                    <div className="flex flex-col text-center gap-y-1 md:gap-y-2">
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-xl' : 'text-xl lg:text-3xl'}`}>
                            {booksDashboardStats.tagsCount}
                        </p>
                        <p className={`text-gray-500 font-bold ${isMobile ? 'text-sm' : 'text-base lg:text-xl'}`}>
                            Etiket
                        </p>
                    </div>
                    <div className="flex flex-row mt-2 md:mt-5 justify-center px-2">
                        <Link to="/admin/tags" className={`button !bg-orange-400 hover:scale-105 font-semibold duration-500 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm lg:text-lg'
                            }`}>
                            {isMobile ? 'Yönet' : 'Etiketleri Yönet'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}