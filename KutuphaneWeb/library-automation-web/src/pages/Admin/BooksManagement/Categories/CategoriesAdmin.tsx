import { useMemo, useState, useEffect, useCallback, useReducer } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import type PaginationHeader from "../../../../types/paginationHeader";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import type { RequestParameters } from "../../../../types/bookRequestParameters";
import type Category from "../../../../types/category";
import AdminPagination from "../../../../components/ui/AdminPagination";
import BackendDataListReducer from "../../../../types/backendDataList";

export default function CategoriesAdmin() {
    const [categories, dispatch] = useReducer(BackendDataListReducer<Category>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [refreshCategories, setRefreshCategories] = useState(0);
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

        return ({
            pageNumber: pageNumber ? parseInt(pageNumber) : 1,
            pageSize: pageSize ? parseInt(pageSize) : 6,
            searchTerm: searchTerm || undefined,
            orderBy: orderBy || undefined,
        });
    }
    const [query, setQuery] = useState<RequestParameters>(getQueriesFromUrl());

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

        const newParamsString = params.toString();
        const currentParamsString = searchParams.toString();

        if (newParamsString !== currentParamsString) {
            setSearchParams(params, { replace: true });
        }
    }, [finalQuery, searchParams]);

    const fetchCategories = async (queryParams: RequestParameters, signal?: AbortSignal) => {
        try {
            const queryString = new URLSearchParams();

            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryString.append(key, value.toString());
                }
            });

            const response = await requests.categories.getAllCategories(queryString, signal);

            const paginationHeaderStr = response.headers?.["x-pagination"];
            if (paginationHeaderStr) {
                const paginationData: PaginationHeader = JSON.parse(paginationHeaderStr);
                setPagination(paginationData);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            return response.data as Category[];
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

    const handleCategoryDelete = async (id: number) => {
        if (window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
            try {
                await requests.categories.deleteCategory(id);
                toast.success("Kategori başarıyla silindi.");
                setRefreshCategories(prev => prev + 1);
            }
            catch (error) {
                toast.error("Kategori silinirken bir hata oluştu.");
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadCategories = async () => {
            dispatch({ type: "FETCH_START" });
            try {
                const categories = await fetchCategories(finalQuery, controller.signal);
                dispatch({ type: "FETCH_SUCCESS", payload: categories as Category[] });
            }
            catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    return;
                }
                else {
                    dispatch({ type: "FETCH_ERROR", payload: error.message || "Kategoriler yüklenirken bir hata oluştu." });
                }
            }
        };

        loadCategories();

        return () => {
            controller.abort();
        };
    }, [finalQuery, refreshCategories]);

    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex-col md:flex-row mx-4 md:mx-8 lg:mx-20 gap-4">
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-4 md:mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">
                    Kategori Yönetimi
                </p>
                <div className={`flex flex-row content-center justify-center bg-white px-4 py-3 rounded-3xl shadow-lg mb-3 ${isMobile ? 'w-full' : 'w-2/6 ml-auto mr-auto'}`}>
                    <div className="flex flex-col w-full content-center justify-center relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 w-full text-sm md:text-base transform transition-all placeholder:text-gray-600 duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)] focus:scale-[102%] focus:bg-white/100"
                            placeholder="Kategori ara..."
                        />
                        {searchInput && <button onClick={() => setSearchInput("")} className="bg-red-600 right-2 rounded-full w-6 h-6 absolute text-white hover:scale-105 duration-300 text-sm">X</button>}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 md:ml-auto">
                    <Link to="/admin/categories/create" className="lg:self-center button !bg-green-400 hover:scale-105 text-sm md:text-lg font-bold duration-500 text-center py-2">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        {isMobile ? "Ekle" : "Yeni Kategori Ekle"}
                    </Link>
                    <Link to="/admin/dashboard/books" className="lg:self-center button font-bold text-sm md:text-lg hover:scale-105 duration-500 text-center py-2">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="px-4 md:px-5 lg:px-20">
                <div className="lg:col-span-3 flex flex-col mt-4 md:mt-8 lg:mt-0">
                    {(categories.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {categories.error && (
                        <div className="flex justify-center items-center h-64 text-red-500 text-center px-4">
                            {categories.error}
                        </div>
                    )}

                    {categories.data && !categories.isLoading && (
                        <>
                            {isMobile ? (
                                <div className="space-y-4">
                                    {categories.data.map((category) => (
                                        <div key={category.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-base text-gray-800 mb-1">
                                                        {category.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        Ana Kategori: {category.parentId ?? "Yok"}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {category.bookCount} Kitap
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/admin/categories/update/${category.id}`}
                                                    className="flex-1 py-2 px-3 bg-yellow-500 text-white rounded text-sm font-medium hover:bg-yellow-600 transition text-center"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                    Düzenle
                                                </Link>
                                                <button
                                                    onClick={() => handleCategoryDelete(category.id!)}
                                                    className="flex-1 py-2 px-3 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                    Sil
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-violet-400">
                                                <tr>
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        İsim
                                                    </th>
                                                    {!isTablet && (
                                                        <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                            Ana Kategori
                                                        </th>
                                                    )}
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Kitap Sayısı
                                                    </th>
                                                    <th className="px-4 py-5 text-center text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        İşlemler
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {categories.data.map((cat) => (
                                                    <tr key={cat.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm md:text-base font-medium text-gray-900">
                                                                {cat.name}
                                                            </div>
                                                            {isTablet && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Ana: {cat.parentId ?? "Yok"}
                                                                </div>
                                                            )}
                                                        </td>
                                                        {!isTablet && (
                                                            <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                                {cat.parentId ?? "Yok"}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                            {cat.bookCount}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-medium">
                                                            <div className="flex justify-center gap-2">
                                                                <Link
                                                                    to={`/admin/categories/update/${cat.id}`}
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
                                                                    onClick={() => handleCategoryDelete(cat.id!)}
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

                    <AdminPagination data={categories.data} pagination={pagination} isLoading={categories.isLoading} error={categories.error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}