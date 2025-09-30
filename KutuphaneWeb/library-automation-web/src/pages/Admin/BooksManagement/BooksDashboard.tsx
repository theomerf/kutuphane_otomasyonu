import { faArrowLeft, faBook, faLayerGroup, faPen, faTags } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import requests from "../../../services/api";
import { useEffect, useState } from "react";

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

    const fetchStats = async () => {
        try {
            const [booksRes, categoriesRes, authorsRes, tagsRes] = await Promise.all([
                requests.books.countBooks(),
                requests.categories.countCategories(),
                requests.authors.countAuthors(),
                requests.tags.countTags(),
            ]);

            setBooksDashboardStats({
                booksCount: booksRes.data,
                categoriesCount: categoriesRes.data,
                authorsCount: authorsRes.data,
                tagsCount: tagsRes.data
            });
        }
        catch (error) {
            console.error("Kitap dashboard istatistikleri çekilirken hata oluştu:", error);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl  text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kitap Yönetimi Dashboard</p>
                <Link to="/admin" className="ml-auto button font-bold text-lg self-center hover:scale-105 duration-500">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Geri
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-x-10 px-20 mt-5">
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faBook} className="text-green-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{booksDashboardStats.booksCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Kitap</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/books" className="button !bg-green-400 hover:scale-105 text-lg font-semibold duration-500">Kitapları Yönet</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faLayerGroup} className="text-blue-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{booksDashboardStats.categoriesCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Kategori</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/categories" className="button !bg-blue-400 hover:scale-105 text-lg font-semibold duration-500">Kategorileri Yönet</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faPen} className="text-red-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{booksDashboardStats.authorsCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Yazar</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/authors" className="button !bg-red-400 hover:scale-105 text-lg font-semibold duration-500">Yazarları Yönet</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 rounded-lg shadow-xl bg-white py-8 border-2 border-gray-200 hover:scale-105 duration-500">
                    <p className="text-gray-500 font-bold text-center text-2xl">
                        <FontAwesomeIcon icon={faTags} className="text-orange-400 text-5xl" />
                    </p>
                    <div className="flex flex-col text-center gap-y-2">
                        <p className="ml-2 text-gray-500 font-bold text-3xl">{booksDashboardStats.tagsCount}</p>
                        <p className="ml-2 text-gray-500 font-bold text-xl">Etiket</p>
                    </div>
                    <div className="flex flex-row mt-5 justify-center">
                        <Link to="/admin/tags" className="button !bg-orange-400 hover:scale-105 text-lg font-semibold duration-500">Etiketleri Yönet</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}