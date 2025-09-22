import { useMemo, useState, useEffect, useCallback } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import type PaginationHeader from "../../../../types/paginationHeader";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import type { RequestParameters } from "../../../../types/bookRequestParameters";
import type Category from "../../../../types/category";
import CategoryPagination from "../../../../components/books/CategoryPagination";

export default function CategoriesAdmin() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Category[] | null>(null);
    const { up } = useBreakpoint();
    const [isDeleted, setIsDeleted] = useState(false);
    const [pagination, setPagination] = useState<PaginationHeader>({
        CurrentPage: 1,
        TotalPage: 0,
        PageSize: 6,
        TotalCount: 0,
        HasPrevious: false,
        HasPage: false
    });
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearch = useDebounce(searchInput, 500);
    const [query, setQuery] = useState<RequestParameters>({
        pageNumber: 1,
        pageSize: 6
    });

    const finalQuery = useMemo(() => ({
        ...query,
        searchTerm: debouncedSearch || undefined
    }), [query, debouncedSearch]);

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
        const controller = new AbortController();

        const loadCategories = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const categories = await fetchCategories(finalQuery);
                setData(categories);
            }
            catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    console.log("Request cancelled");
                }
                else {
                    setError("Kategoriler yüklenirken bir hata oluştu.");
                }
            }
            finally {
                setIsLoading(false);
            }
        };

        loadCategories();

        return () => {
            controller.abort();
        };
    }, [finalQuery, isDeleted]);

    const handleCategoryDelete = async (id: number) => {
        if (window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
            try {
                await requests.categories.deleteCategory(id);
                setIsDeleted(true);
                toast.success("Kategori başarıyla silindi.");
            }
            catch (error) {
                setError("Kategori silinirken bir hata oluştu.");
            }
        }
    };

    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex- row">
                <p className="font-semibold text-4xl ml-8 lg:ml-20 text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kategori Yönetimi</p>
                <div className="flex flex-row ml-auto mr-auto content-center justify-center">
                    <div className="flex flex-col  content-center justify-center relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)] focus:scale-[102%] focus:bg-white/100"
                            placeholder="Kategori ara..."
                        />
                        {searchInput && <button onClick={() => setSearchInput("")} className="bg-red-600 right-2 rounded-full w-6 h-6 absolute text-white hover:scale-105 duration-300">X</button>}
                    </div>
                </div>
                <Link to="/admin/categories/create" className="button !bg-green-400 hover:scale-105 text-lg font-bold duration-500 self-center ml-auto mr-20">
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Yeni Kategori Ekle
                </Link>
            </div>
            <div className="sm:px-1 px-5 lg:px-20">


                <div className="lg:col-span-3 flex flex-col mt-8 lg:mt-0">
                    {(isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {error && (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            {error}
                        </div>
                    )}

                    {data && !isLoading && (
                        <div>
                            <table className="table-auto w-full border-collapse border border-gray-200 bg-white shadow-lg">
                                <thead>
                                    <tr className="bg-violet-400">
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tl-lg px-4 py-6 text-center">İsim</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Ana Kategori</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Kitap Sayısı</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tr-lg px-4 py-6 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50">
                                            <td className="text-gray-500 font-semibold text-lg border-t border-violet-200 px-4 py-6">{cat.name}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{cat.parentId ?? "Yok"}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{cat.bookCount}</td>
                                            <td className="border-l border-t border-b border-violet-200 px-4 py-6">
                                                <div className="flex flex-row justify-center gap-x-2">
                                                    <Link to={`/admin/categories/update/${cat.id}`} title="Düzenle" className="bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-yellow-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faEdit} className="self-center" />
                                                    </Link>
                                                    <button onClick={() => handleCategoryDelete(cat.id!)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
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

                    <CategoryPagination data={data} pagination={pagination} isLoading={isLoading} error={error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}