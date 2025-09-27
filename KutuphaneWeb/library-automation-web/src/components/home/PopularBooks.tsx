import { useEffect, useState } from "react";
import requests from "../../services/api";
import type Book from "../../types/book";
import { motion } from "framer-motion";
import BookCard from "../books/BookCard";
import { ClipLoader } from "react-spinners";

export default function PopularBooks() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Book[] | null>(null);
    const fetchBooks = async (signal?: AbortSignal) => {
        try {
            const queryString = new URLSearchParams();

            queryString.append("isPopular", "true");
            queryString.append("pageSize", "10");

            const response = await requests.books.getAllBooks(queryString, signal);

            return response.data as Book[];
        }
        catch (error) {
            if ((error as any).name !== "CanceledError" && (error as any).name !== "AbortError") {
                throw error;
            }
            return [];
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadBooks = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const books = await fetchBooks();
                setData(books);
            }
            catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    console.log("Request cancelled");
                }
                else {
                    setError("Popüler kitaplar yüklenirken bir hata oluştu.");
                }
            }
            finally {
                setIsLoading(false);
            }
        };

        loadBooks();

        return () => {
            controller.abort();
        };
    }, []);
    return (
        <div className="rounded-lg border-gray-200 border shadow-lg">
            <div className="flex flex-col gap-y-14">
                <div className="bg-violet-400 rounded-tl rounded-tr-lg py-8 sm:px-1 px-5 lg:px-20">
                    <p className="text-white text-4xl font-bold text-center">Popüler Kitaplar</p>
                </div>
                <div className="pt-6 px-6 pb-10">
                    {(isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {error && (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            Kitaplar yüklenirken bir hata oluştu.
                        </div>
                    )}

                    {data && !isLoading && (
                        <motion.div initial="hidden" animate="show"
                            variants={{
                                hidden: {},
                                show: { transition: { staggerChildren: 0.15 } }
                            }}>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-20 lg:gap-x-10 lg:gap-y-20">
                                {data.map(book => (
                                    <BookCard key={book.id} book={book} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}