import { useMemo, useState, useEffect, useCallback } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import type PaginationHeader from "../../../../types/paginationHeader";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faEdit, faEye, faEyeSlash, faKey, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import type { RequestParameters } from "../../../../types/bookRequestParameters";
import type Account from "../../../../types/account";
import AdminPagination from "../../../../components/ui/AdminPagination.tsx";
import { useForm } from "react-hook-form";

export default function AccountsAdmin() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Account[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            id: "",
            password: "",
        }
    });
    const { up } = useBreakpoint();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isDeleted, setIsDeleted] = useState(false);
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

    const fetchAccounts = async (queryParams: RequestParameters, signal?: AbortSignal) => {
        try {
            const queryString = new URLSearchParams();

            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryString.append(key, value.toString());
                }
            });

            const response = await requests.account.getAllAccounts(queryString, signal);

            const paginationHeaderStr = response.headers?.["x-pagination"];
            if (paginationHeaderStr) {
                const paginationData: PaginationHeader = JSON.parse(paginationHeaderStr);
                setPagination(paginationData);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            return response.data as Account[];
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

    useEffect(() => {
        const controller = new AbortController();

        const loadAccounts = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const accounts = await fetchAccounts(finalQuery, controller.signal);
                setData(accounts);
            }
            catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    console.log("Request cancelled");
                }
                else {
                    setError("Kullanıcılar yüklenirken bir hata oluştu.");
                }
            }
            finally {
                setIsLoading(false);
            }
        };

        loadAccounts();

        return () => {
            controller.abort();
        };
    }, [finalQuery, isDeleted]);

    const handleAccountDelete = async (id: string) => {
        if (window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
            try {
                await requests.account.deleteAccount(id);
                setIsDeleted(true);
                toast.success("Kullanıcı başarıyla silindi.");
            }
            catch (error) {
                setError("Kullanıcı silinirken bir hata oluştu.");
            }
        }
    };

    const handlePasswordReset = async (formData: any) => {
        if (selectedId) {
            try {
                setIsLoading(true);
                await requests.account.resetPassword(formData);
                setIsModalOpen(false);
                toast.success('Şifre başarıyla sıfırlandı!');
            } catch (error: any) {
                console.error('Şifre sıfırlama hatası:', error);
                toast.error('Şifre sıfırlanırken hata oluştu.');
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (selectedId) {
            setValue("id", selectedId);
        }
    }, [selectedId, setValue]);

    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    }, []);

    return (
        <>
            <div className="flex flex-col">
                <div className="flex flex-row mx-8 lg:mx-20">
                    <p className="font-semibold text-4xl text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kullanıcı Yönetimi</p>
                    <div className="flex flex-row ml-auto mr-auto content-center justify-center bg-white px-4 py-3 rounded-3xl shadow-lg mb-3 w-2/6">
                        <div className="flex flex-col w-full content-center justify-center relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={handleSearchInputChange}
                                className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 w-full text-base transform transition-all placeholder:text-gray-600 duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)] focus:scale-[102%] focus:bg-white/100"
                                placeholder="Kullanıcı ara..."
                            />
                            {searchInput && <button onClick={() => setSearchInput("")} className="bg-red-600 right-2 rounded-full w-6 h-6 absolute text-white hover:scale-105 duration-300">X</button>}
                        </div>
                    </div>
                    <div className="flex flex-row gap-x-4 ml-auto">
                        <Link to="/admin" className="button font-bold text-lg self-center hover:scale-105 duration-500">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Geri
                        </Link>
                        <Link to="/admin/accounts/create" className="button !bg-green-400 hover:scale-105 text-lg font-bold duration-500 self-center">
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Yeni Kullanıcı Ekle
                        </Link>
                    </div>
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
                                            <th className="text-white font-bold text-lg border border-gray-200 rounded-tl-lg px-4 py-6 text-center">Avatar</th>
                                            <th className="text-white font-bold text-lg border border-gray-200 rounded-tl-lg px-4 py-6 text-center">Id</th>
                                            <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Kullanıcı Adı</th>
                                            <th className="text-white font-bold text-lg border border-gray-200 rounded-tr-lg px-4 py-6 text-center">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((account) => (
                                            <tr key={account.id} className="hover:bg-gray-50">
                                                <td className="border-t border-violet-200 justify-center flex px-4 py-6">
                                                    <img src={"https://localhost:7214/images/" + account.avatarUrl!} alt={account.userName + "Profil Fotoğrafı"} className="w-16 h-auto object-contain hover:scale-105 duration-500" />
                                                </td>
                                                <td className="text-gray-500 font-semibold text-lg border-t border-violet-200 px-4 py-6">{account.id}</td>
                                                <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{account.userName}</td>
                                                <td className="border-l border-t border-b border-violet-200 px-4 py-6">
                                                    <div className="flex flex-row justify-center gap-x-2">
                                                        <Link to={`/admin/accounts/update/${account.id}`} title="Düzenle" className="bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-yellow-600 duration-500 text-lg">
                                                            <FontAwesomeIcon icon={faEdit} className="self-center" />
                                                        </Link>
                                                        <button onClick={() => { setSelectedId(account.id!); setIsModalOpen(true); }} title="Şifre Sıfırla" className="bg-blue-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-blue-600 duration-500 text-lg">
                                                            <FontAwesomeIcon icon={faKey} className="self-center" />
                                                        </button>
                                                        <button onClick={() => handleAccountDelete(account.id!)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
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

                        <AdminPagination data={data} pagination={pagination} isLoading={isLoading} error={error} up={up} query={query} setQuery={setQuery} />
                    </div>
                </div>
            </div>
            {isModalOpen &&
                <div className="fixed px-5 lg:px-0 inset-0 lg:inset-0 mt-20 overflow-auto lg:mt-20 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="flex flex-col bg-white rounded-3xl shadow-lg">
                        <div className="bg-violet-400 py-2 lg:py-4 flex flex-col text-center gap-y-1 px-10 lg:px-32 rounded-tr-3xl rounded-tl-3xl">
                            <p className="font-bold text-lg lg:text-xl text-white">
                                <FontAwesomeIcon icon={faKey} className="mr-2" />
                                ŞİFRE SIFIRLA
                            </p>
                        </div>
                        <div>
                            <form method="POST" onSubmit={handleSubmit(handlePasswordReset)} noValidate>
                                <div className="flex flex-row gap-x-4 px-10 mt-6">
                                    <input type="hidden" {...register("id")} id="id" name="id" />
                                    <div className="flex flex-col w-full">
                                        <label htmlFor="password" className="font-bold text-gray-500 text-base">Yeni Şifre</label>
                                        <div className="flex mt-4">
                                            <input type={`${passwordVisible ? 'text' : 'password'}`} {...register("password", {
                                                required: "Şifre gereklidir.",
                                                minLength: {
                                                    value: 6,
                                                    message: "Şifre min. 6 karakter olmalıdır."
                                                },
                                                maxLength: {
                                                    value: 20,
                                                    message: "Şifre max. 20 karakter olmalıdır."
                                                }
                                            })} id="password" name="password" className="passwordInput" />
                                            <button type="button" onClick={passwordVisible ? () => setPasswordVisible(false) : () => setPasswordVisible(true)} className="cursor-pointer border-2 border-[#e5e7eb] border-l-0 rounded-[0_12px_12px_0] text-white bg-hero-gradient px-4 py-3 transform transition-all duration-500 hover:bg-violet-400  hover:shadow-md hover:transition-all hover:scale-105">
                                                <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} title={passwordVisible ? "Gizle" : "Göster"} />
                                            </button>
                                        </div>
                                        {errors.password && <span className="text-red-700 text-left mt-1">{errors.password?.message?.toString()}</span>}
                                    </div>
                                </div>
                                <div className="flex content-center justify-center gap-x-4 mt-6 mb-6">
                                    <button type="submit" className="smallButton text-sm lg:button font-semibold lg:hover:scale-105">
                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                        Onayla
                                    </button>
                                    <button onClick={() => {
                                        setIsModalOpen(false);
                                    }} className="smallButton text-sm lg:button font-semibold !bg-red-500 lg:hover:scale-105">
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                        Geri Dön
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            }
        </>

    );
}