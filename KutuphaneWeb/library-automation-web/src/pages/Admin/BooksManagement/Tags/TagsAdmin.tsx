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
import type Tag from "../../../../types/category";
import AdminPagination from "../../../../components/ui/AdminPagination";
import BackendDataListReducer from "../../../../types/backendDataList";

export default function TagsAdmin() {
    const [tags, dispatch] = useReducer(BackendDataListReducer<Tag>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [refreshTags, setRefreshTags] = useState(0);
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

    const fetchTags = async (queryParams: RequestParameters, signal?: AbortSignal) => {
        try {
            const queryString = new URLSearchParams();

            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryString.append(key, value.toString());
                }
            });

            const response = await requests.tags.getAllTags(queryString, signal);

            const paginationHeaderStr = response.headers?.["x-pagination"];
            if (paginationHeaderStr) {
                const paginationData: PaginationHeader = JSON.parse(paginationHeaderStr);
                setPagination(paginationData);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            return response.data as Tag[];
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

    const handleTagDelete = async (id: number) => {
        if (window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
            try {
                await requests.tags.deleteTag(id);
                toast.success("Etiket başarıyla silindi.");
                setRefreshTags(prev => prev + 1);
            }
            catch (error) {
                toast.error("Etiket silinirken bir hata oluştu.");
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadTags = async () => {
            dispatch({ type: "FETCH_START" });
            try {
                const tags = await fetchTags(finalQuery, controller.signal);
                dispatch({ type: "FETCH_SUCCESS", payload: tags as Tag[] });
            }
            catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    return;
                }
                else {
                    dispatch({ type: "FETCH_ERROR", payload: error.message || 'Etiketler yüklenirken bir hata oluştu.' });
                }
            }
        };

        loadTags();

        return () => {
            controller.abort();
        };
    }, [finalQuery, refreshTags]);



    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex- row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Etiket Yönetimi</p>
                <div className="flex flex-row ml-auto mr-auto content-center justify-center bg-white px-4 py-3 rounded-3xl shadow-lg mb-3 w-2/6">
                    <div className="flex flex-col w-full content-center justify-center relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 w-full text-base transform transition-all placeholder:text-gray-600 duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)] focus:scale-[102%] focus:bg-white/100"
                            placeholder="Etiket ara..."
                        />
                        {searchInput && <button onClick={() => setSearchInput("")} className="bg-red-600 right-2 rounded-full w-6 h-6 absolute text-white hover:scale-105 duration-300">X</button>}
                    </div>
                </div>
                <div className="flex flex-row gap-x-4 ml-auto">
                    <Link to="/admin/tags/create" className="button !bg-green-400 hover:scale-105 text-lg font-bold duration-500 self-center">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Yeni Etiket Ekle
                    </Link>
                    <Link to="/admin/dashboard/books" className="button font-bold text-lg self-center hover:scale-105 duration-500">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="sm:px-1 px-5 lg:px-20">


                <div className="lg:col-span-3 flex flex-col mt-8 lg:mt-0">
                    {(tags.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {tags.error && (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            {tags.error}
                        </div>
                    )}

                    {tags.data && !tags.isLoading && (
                        <div>
                            <table className="table-auto w-full border-collapse border border-gray-200 bg-white shadow-lg">
                                <thead>
                                    <tr className="bg-violet-400">
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tl-lg px-4 py-6 text-center">İsim</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Kitap Sayısı</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tr-lg px-4 py-6 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tags.data.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50">
                                            <td className="text-gray-500 font-semibold text-lg border-t border-violet-200 px-4 py-6">{cat.name}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{cat.bookCount}</td>
                                            <td className="border-l border-t border-b border-violet-200 px-4 py-6">
                                                <div className="flex flex-row justify-center gap-x-2">
                                                    <Link to={`/admin/tags/update/${cat.id}`} title="Düzenle" className="bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-yellow-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faEdit} className="self-center" />
                                                    </Link>
                                                    <button onClick={() => handleTagDelete(cat.id!)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
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

                    <AdminPagination data={tags.data} pagination={pagination} isLoading={tags.isLoading} error={tags.error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}