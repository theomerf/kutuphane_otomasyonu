import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import type Book from "../../types/book";
import BackendDataListReducer from "../../types/backendDataList";
import { useEffect, useReducer } from "react";
import requests from "../../services/api";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import type { RootState } from "../../store/store";
import { motion } from "framer-motion";
import BookCard from "../../components/books/BookCard";

export default function Favorites() {
    const { favorites, status, error } = useSelector((state: RootState) => state.favorites);
    const [favoriteBooks, dispatchFavoriteBooks] = useReducer(BackendDataListReducer<Book>, {
        data: null,
        isLoading: false,
        error: null
    });

    useEffect(() => {
        const controller = new AbortController();

        fetchFavoriteBooks(controller.signal);

        return () => {
            controller.abort();
        };
    }, [favorites]);

    const fetchFavoriteBooks = async (signal: AbortSignal) => {
        dispatchFavoriteBooks({ type: "FETCH_START" });
        try {
            const queryString = new URLSearchParams();

            favorites!.forEach(id => {
                queryString.append('ids', id.toString());
            });

            var response = await requests.books.favoriteBooks(queryString, signal);
            dispatchFavoriteBooks({ type: "FETCH_SUCCESS", payload: response.data as Book[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                dispatchFavoriteBooks({ type: "FETCH_ERROR", payload: error.message || "Favori kitaplar yüklenirken bir hata oluştu." });
            }
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl  text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Favoriler</p>
            </div>

            <div className="flex flex-col gap-y-4 border-gray-200 border shadow-lg mx-20 px-4 py-6 rounded-lg bg-white">
                {(favoriteBooks.isLoading || status === "pending") && (
                    <div className="flex justify-center items-center h-64">
                        <ClipLoader size={40} color="#8B5CF6" />
                    </div>
                )}

                {favoriteBooks.error || error && (
                    <div className="flex justify-center items-center h-64 text-red-500">
                        <p>{favoriteBooks.error || error}</p>
                    </div>
                )}

                {(!favoriteBooks.isLoading && status != "pending" && !favoriteBooks.error && favoriteBooks.data && favoriteBooks.data.length === 0) && (
                    <div className="flex flex-col gap-y-6 justify-center items-center h-64 ">
                        <FontAwesomeIcon icon={faQuestion} className="text-5xl text-violet-400 animate-pulse" />
                        <p className="text-gray-500 text-2xl">Henüz favori kitabınız yok.</p>
                        <Link to="/books" className="button hover:scale-105 duration-500">Kitaplara göz atın.</Link>
                    </div>
                )}

                {(!favoriteBooks.isLoading && !error && !favoriteBooks.error && status != "pending" && favoriteBooks.data && favoriteBooks.data.length > 0) && (

                    <motion.div initial="hidden" animate="show"
                        variants={{
                            hidden: {},
                            show: { transition: { staggerChildren: 0.15 } }
                        }}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-20 px-3 lg:gap-x-10 lg:gap-y-20 lg:px-20">
                            {favoriteBooks.data.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}