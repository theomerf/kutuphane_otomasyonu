import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import requests from "../../../../services/api";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import type Penalty from "../../../../types/penalty";
import { ClipLoader } from "react-spinners";
import type { RequestParameters } from "../../../../types/bookRequestParameters";
import type PaginationHeader from "../../../../types/paginationHeader";
import { useDebounce } from "../../../../hooks/useDebounce";
import AdminPagination from "../../../../components/ui/AdminPagination";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";
import BackendDataListReducer from "../../../../types/backendDataList";


export default function PenaltiesAdmin() {
    const [penalties, dispatch] = useReducer(BackendDataListReducer<Penalty>, {
        data: [],
        isLoading: false,
        error: null
    });
    const [refreshPenalties, setRefreshPenalties] = useState(0);
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
    const { up } = useBreakpoint();

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

    async function fetchPenalties(queryParams: RequestParameters, signal: AbortSignal) {
        dispatch({ type: "FETCH_START" });

        try {
            const queryString = new URLSearchParams();

            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryString.append(key, value.toString());
                }
            });
            const response = await requests.penalty.getAllPenalties(queryString, signal);
            const parsedResponse = response.data.map((penalty: Penalty) => ({
                ...penalty,
                issuedDate: new Date(penalty.issuedDate!).toLocaleDateString("tr-TR"),
            }));

            const paginationHeaderStr = response.headers?.["x-pagination"];
            if (paginationHeaderStr) {
                const paginationData: PaginationHeader = JSON.parse(paginationHeaderStr);
                setPagination(paginationData);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });

            dispatch({ type: "FETCH_SUCCESS", payload: parsedResponse });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Cezalar çekilirken bir hata oluştu" });
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchPenalties(finalQuery, controller.signal);

        return () => {
            controller.abort();
        };
    }, [finalQuery, refreshPenalties]);

    useEffect(() => {
        modifyUrl();
    }, [finalQuery]);

    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    }, []);

    const handlePenaltyPaid = async (id: number) => {
        try {
            await requests.penalty.payPenalty(id);
            toast.success("Ceza ödendi olarak işaretlendi");
            setRefreshPenalties(prev => prev + 1);
        }
        catch (error: any) {
            console.error(error);
            toast.error(error.message || "Ceza güncellenirken bir hata oluştu");
        }
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl  text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Ceza Yönetimi</p>
                <div className="flex flex-row ml-auto mr-auto content-center justify-center bg-white px-4 py-3 rounded-3xl shadow-lg mb-3 w-2/6">
                    <div className="flex flex-col w-full content-center justify-center relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 w-full text-base transform transition-all placeholder:text-gray-600 duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)] focus:scale-[102%] focus:bg-white/100"
                            placeholder="Kullanıcı adıyla ceza ara.."
                        />
                        {searchInput && <button onClick={() => setSearchInput("")} className="bg-red-600 right-2 rounded-full w-6 h-6 absolute text-white hover:scale-105 duration-300">X</button>}
                    </div>
                </div>
                <div className="flex flex-row gap-x-4 ml-auto ">
                    <Link to="/admin/dashboard/loans" className="button font-bold text-lg self-center hover:scale-105 duration-500">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="px-5 lg:px-20">
                <div className="lg:col-span-3 flex flex-col mt-8 lg:mt-0">
                    {(penalties.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {penalties.error && (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            {penalties.error}
                        </div>
                    )}

                    {penalties.data && !penalties.isLoading && (
                        <div>
                            <table className="table-auto w-full border-collapse border border-gray-200 bg-white shadow-lg">
                                <thead>
                                    <tr className="bg-violet-400">
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tl-lg px-4 py-6 text-center">Id</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Ceza Verilen Bilgisi</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Ceza Verilen Tarih</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Ceza Nedeni</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Ceza Miktarı</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Durum</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tr-lg px-4 py-6 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {penalties.data.map((penalty) => (
                                        <tr key={penalty.id} className="hover:bg-gray-50">
                                            <td className="text-gray-500 font-semibold text-lg border-t border-violet-200 px-4 py-6">{penalty.id}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{penalty.accountFirstName} {penalty.accountLastName} ({penalty.accountUserName})</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{penalty.issuedDate}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{penalty.reason}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{penalty.amount}₺</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6 text-center"><p className={`rounded-full text-white shadow-md hover:scale-105 duration-500 py-1 ${penalty.isPaid ? "bg-green-500" : "bg-red-500"}`}>{penalty.isPaid ? "Ödendi" : "Ödenmedi"}</p></td>
                                            <td className="border-l border-t border-b border-violet-200 px-4 py-6">
                                                <div className="flex flex-row justify-center gap-x-2">
                                                    {!penalty.isPaid && <button onClick={() => handlePenaltyPaid(penalty.id!)} title="Ödendi Olarak İşaretle" className="bg-green-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-green-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faMoneyBill} className="self-center" />
                                                    </button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <AdminPagination data={penalties.data} pagination={pagination} isLoading={penalties.isLoading} error={penalties.error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}