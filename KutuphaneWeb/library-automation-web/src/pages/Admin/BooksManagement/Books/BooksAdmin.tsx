import { useMemo, useState, useEffect, useCallback, useReducer } from "react";
import type BookRequestParameters from "../../../../types/bookRequestParameters";
import requests from "../../../../services/api";
import type Book from "../../../../types/book";
import { ClipLoader } from "react-spinners";
import type PaginationHeader from "../../../../types/paginationHeader";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";
import Filters, { type FilterSection } from "../../../../components/books/Filters";
import BookPagination from "../../../../components/books/BookPagination";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import BackendDataListReducer from "../../../../types/backendDataList";

export default function BooksAdmin() {
    const [books, dispatch] = useReducer(BackendDataListReducer<Book>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [refreshBooks, setRefreshBooks] = useState(0);
    const [openSections, setOpenSections] = useState<string[]>(["categories", "authors", "other"]);
    const isOthersOpen: boolean = openSections.includes("other");
    const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
    const [filters, setFilters] = useState<FilterSection[]>([]);
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    const isTablet = up.md && !up.lg;
    const [searchParams, setSearchParams] = useSearchParams();
    const [pagination, setPagination] = useState<PaginationHeader>({
        CurrentPage: 1,
        TotalPage: 0,
        PageSize: 6,
        TotalCount: 0,
        HasPrevious: false,
        HasPage: false
    });
    const getInitialSearchFromUrl = () => {
        const searchTerm = searchParams.get("searchTerm");
        return searchTerm || "";
    }
    const [searchInput, setSearchInput] = useState<string>(getInitialSearchFromUrl());
    const debouncedSearch = useDebounce(searchInput, 500);
    const getQueriesFromUrl = () => {
        const pageNumber = searchParams.get("pageNumber");
        const pageSize = searchParams.get("pageSize");
        const searchTerm = searchParams.get("searchTerm");
        const orderBy = searchParams.get("orderBy");
        const authorId = searchParams.get("authorId");
        const categoryId = searchParams.get("categoryId");
        const isAvailable = searchParams.get("isAvailable");
        const isPopular = searchParams.get("isPopular");

        return ({
            pageNumber: pageNumber ? parseInt(pageNumber) : 1,
            pageSize: pageSize ? parseInt(pageSize) : 6,
            searchTerm: searchTerm || undefined,
            orderBy: orderBy || undefined,
            authorId: authorId ? parseInt(authorId) : undefined,
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            isAvailable: isAvailable ? isAvailable === "true" : undefined,
            isPopular: isPopular ? isPopular === "true" : undefined
        });
    }

    const [query, setQuery] = useState<BookRequestParameters>(getQueriesFromUrl());

    const finalQuery = useMemo(() => ({
        ...query,
        searchTerm: debouncedSearch || undefined
    }), [query, debouncedSearch]);

    const modifyUrl = useCallback(() => {
        const params = new URLSearchParams();

        if (finalQuery.pageNumber && finalQuery.pageNumber !== 1) {
            params.set("pageNumber", finalQuery.pageNumber.toString());
        }
        if (finalQuery.pageSize && finalQuery.pageSize !== 6) {
            params.set("pageSize", finalQuery.pageSize.toString());
        }
        if (finalQuery.searchTerm) {
            params.set("searchTerm", finalQuery.searchTerm);
        }
        if (finalQuery.orderBy) {
            params.set("orderBy", finalQuery.orderBy);
        }
        if (finalQuery.authorId) {
            params.set("authorId", finalQuery.authorId.toString());
        }
        if (finalQuery.categoryId) {
            params.set("categoryId", finalQuery.categoryId.toString());
        }
        if (finalQuery.isAvailable !== undefined) {
            params.set("isAvailable", finalQuery.isAvailable.toString());
        }
        if (finalQuery.isPopular !== undefined) {
            params.set("isPopular", finalQuery.isPopular.toString());
        }

        const newParamsString = params.toString();
        const currentParamsString = searchParams.toString();

        if (newParamsString !== currentParamsString) {
            setSearchParams(params, { replace: true });
        }
    }, [finalQuery, searchParams]);

    const fetchBooks = async (queryParams: BookRequestParameters, signal?: AbortSignal) => {
        try {
            const queryString = new URLSearchParams();

            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryString.append(key, value.toString());
                }
            });

            const response = await requests.books.getAllBooks(queryString, signal);

            const paginationHeaderStr = response.headers?.["x-pagination"];
            if (paginationHeaderStr) {
                const paginationData: PaginationHeader = JSON.parse(paginationHeaderStr);
                setPagination(paginationData);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        modifyUrl();
    }, [finalQuery]);

    const handleBookDelete = async (id: number) => {
        if (window.confirm("Bu kitabı silmek istediğinize emin misiniz?")) {
            try {
                await requests.books.deleteBook(id);
                toast.success("Kitap başarıyla silindi.");
                setRefreshBooks(prev => prev + 1);
            }
            catch (error) {
                toast.error("Kitap silinirken bir hata oluştu.");
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadBooks = async () => {
            dispatch({ type: "FETCH_START" });
            try {
                const books = await fetchBooks(finalQuery, controller.signal);
                dispatch({ type: "FETCH_SUCCESS", payload: books as Book[] });
            }
            catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    return;
                }
                else {
                    dispatch({ type: "FETCH_ERROR", payload: error.message || "Kitaplar yüklenirken bir hata oluştu." });
                }
            }
        };

        loadBooks();

        return () => {
            controller.abort();
        };
    }, [finalQuery, refreshBooks]);

    return (
        <div className="flex flex-col">
            <div className="flex flex-col md:flex-row mx-4 md:mx-8 lg:mx-20 gap-4">
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-4 md:mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">
                    Kitap Yönetimi
                </p>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 md:ml-auto">
                    <Link
                        to="/admin/books/create"
                        className="lg:self-center flex flex-row items-center justify-center button !bg-green-400 font-bold text-sm lg:text-lg hover:scale-105 duration-500 whitespace-nowrap px-4 py-2"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        {isMobile ? "Ekle" : "Yeni Kitap Ekle"}
                    </Link>
                    <Link
                        to="/admin/dashboard/books"
                        className="lg:self-center flex flex-row items-center justify-center button font-bold text-sm lg:text-lg hover:scale-105 duration-500 whitespace-nowrap px-4 py-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>

            <div className="px-4 md:px-5 lg:px-20 lg:grid lg:grid-cols-4 gap-4">
                <Filters
                    isFiltersOpen={isFiltersOpen}
                    setIsFiltersOpen={setIsFiltersOpen}
                    filters={filters}
                    setFilters={setFilters}
                    openSections={openSections}
                    setOpenSections={setOpenSections}
                    isOthersOpen={isOthersOpen}
                    searchInput={searchInput}
                    query={query}
                    setQuery={setQuery}
                    setSearchInput={setSearchInput}
                    debouncedSearch={debouncedSearch}
                    up={up}
                />

                <div className="lg:col-span-3 flex flex-col mt-8 lg:mt-0">
                    {books.isLoading && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {books.error && (
                        <div className="flex justify-center items-center h-64 text-red-500 text-center px-4">
                            Kitaplar yüklenirken bir hata oluştu.
                        </div>
                    )}

                    {books.data && !books.isLoading && (
                        <>
                            {isMobile && (
                                <div className="space-y-4">
                                    {books.data.map((book) => (
                                        <div key={book.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                            <div className="flex gap-3">
                                                <img
                                                    src={book.images![0].imageUrl!}
                                                    alt={book.images![0].caption!}
                                                    className="w-20 h-28 object-cover rounded flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base text-gray-800 mb-1 line-clamp-2">
                                                        {book.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {book.authors![0].name}
                                                    </p>
                                                    <div className="flex gap-2 mt-3">
                                                        <Link
                                                            to={`/admin/books/update/${book.id}`}
                                                            className="flex-1 py-2 px-3 bg-yellow-500 text-white rounded text-sm font-medium hover:bg-yellow-600 transition text-center"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                            Düzenle
                                                        </Link>
                                                        <button
                                                            onClick={() => handleBookDelete(book.id!)}
                                                            className="flex-1 py-2 px-3 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                            Sil
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isMobile && (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-violet-400">
                                                <tr>
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Kapak
                                                    </th>
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Başlık
                                                    </th>
                                                    {!isTablet && (
                                                        <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                            Yazar
                                                        </th>
                                                    )}
                                                    <th className="px-4 py-5 text-center text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        İşlemler
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {books.data.map((book) => (
                                                    <tr key={book.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <img
                                                                src={book.images![0].imageUrl!}
                                                                alt={book.images![0].caption!}
                                                                className="w-12 md:w-16 h-auto object-contain rounded"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm md:text-base font-medium text-gray-900">
                                                                {book.title}
                                                            </div>
                                                            {isTablet && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {book.authors![0].name}
                                                                </div>
                                                            )}
                                                        </td>
                                                        {!isTablet && (
                                                            <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                                {book.authors![0].name}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-4 text-sm font-medium">
                                                            <div className="flex justify-center gap-2">
                                                                <Link
                                                                    to={`/admin/books/update/${book.id}`}
                                                                    title="Düzenle"
                                                                    className="group relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/50 hover:scale-110 active:scale-95"
                                                                >
                                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                    <FontAwesomeIcon
                                                                        icon={faEdit}
                                                                        className="relative z-10 text-sm md:text-base text-white drop-shadow-sm group-hover:rotate-12 transition-transform duration-300"
                                                                    />
                                                                    <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-300 to-amber-500 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleBookDelete(book.id!)}
                                                                    title="Sil"
                                                                    className="group relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-red-600/50 hover:scale-110 active:scale-95"
                                                                >
                                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                    <FontAwesomeIcon
                                                                        icon={faTrash}
                                                                        className="relative z-10 text-sm md:text-base text-white drop-shadow-sm group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300"
                                                                    />
                                                                    <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-400 to-red-600 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <BookPagination
                        data={books.data}
                        pagination={pagination}
                        isLoading={books.isLoading}
                        error={books.error}
                        up={up}
                        query={query}
                        setQuery={setQuery}
                    />
                </div>
            </div>
        </div>
    );
}