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
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kitap Yönetimi</p>
                <div className="flex flex-row gap-x-4 ml-auto">
                    <Link to="/admin/books/create" className="button !bg-green-400 hover:scale-105 text-lg font-bold duration-500 self-center">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Yeni Kitap Ekle
                    </Link>
                    <Link to="/admin/dashboard/books" className="button font-bold text-lg self-center hover:scale-105 duration-500">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="sm:px-1 px-5 lg:px-20 lg:grid lg:grid-cols-4">
                <Filters isFiltersOpen={isFiltersOpen} setIsFiltersOpen={setIsFiltersOpen} filters={filters} setFilters={setFilters} openSections={openSections} setOpenSections={setOpenSections} isOthersOpen={isOthersOpen} searchInput={searchInput} query={query} setQuery={setQuery} setSearchInput={setSearchInput} debouncedSearch={debouncedSearch} up={up} />

                <div className="lg:col-span-3 flex flex-col mt-8 lg:mt-0">
                    {(books.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {books.error && (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            Kitaplar yüklenirken bir hata oluştu.
                        </div>
                    )}

                    {books.data && !books.isLoading && (
                        <div>
                            <table className="table-auto w-full border-collapse border border-gray-200 bg-white shadow-lg">
                                <thead>
                                    <tr className="bg-violet-400">
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tl-lg px-4 py-6 text-center">Kapak</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Başlık</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Yazar</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tr-lg px-4 py-6 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.data.map((book) => (
                                        <tr key={book.id} className="hover:bg-gray-50">
                                            <td className="border-t border-violet-200 justify-center flex px-4 py-6">
                                                <img src={book.images![0].imageUrl!} alt={book.images![0].caption!} className="w-16 h-auto object-contain hover:scale-105 duration-500" />
                                            </td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{book.title}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{book.authors![0].name}</td>
                                            <td className="border-l border-t border-b border-violet-200 px-4 py-6">
                                                <div className="flex flex-row justify-center gap-x-2">
                                                    <Link to={`/admin/books/update/${book.id}`} title="Düzenle" className="bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-yellow-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faEdit} className="self-center" />
                                                    </Link>
                                                    <button onClick={() => handleBookDelete(book.id!)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faTrash} className="self-center" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <BookPagination data={books.data} pagination={pagination} isLoading={books.isLoading} error={books.error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}