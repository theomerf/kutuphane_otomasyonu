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
    const isMobile = !up.md;
    const isTablet = up.md && !up.lg;

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
            <div className="flex flex-col md:flex-row mx-4 md:mx-8 lg:mx-20 gap-4">
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-4 md:mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">
                    {isMobile ? 'Cezalar' : 'Ceza Yönetimi'}
                </p>
                <div className={`flex flex-row content-center justify-center bg-white px-4 py-3 rounded-3xl shadow-lg mb-3 ${isMobile ? 'w-full' : 'w-2/6 ml-auto mr-auto'}`}>
                    <div className="flex flex-col w-full content-center justify-center relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 w-full text-sm md:text-base transform transition-all placeholder:text-gray-600 duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)] focus:scale-[102%] focus:bg-white/100"
                            placeholder="Kullanıcı ara..."
                        />
                        {searchInput && <button onClick={() => setSearchInput("")} className="bg-red-600 right-2 rounded-full w-6 h-6 absolute text-white hover:scale-105 duration-300 text-sm">X</button>}
                    </div>
                </div>
                <div className="flex md:ml-auto">
                    <Link to="/admin/dashboard/loans" className="lg:self-center button font-bold text-sm md:text-lg hover:scale-105 duration-500 py-2">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="px-4 md:px-5 lg:px-20">
                <div className="lg:col-span-3 flex flex-col mt-4 md:mt-8 lg:mt-0">
                    {(penalties.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {penalties.error && (
                        <div className="flex justify-center items-center h-64 text-red-500 text-center px-4">
                            {penalties.error}
                        </div>
                    )}

                    {penalties.data && !penalties.isLoading && (
                        <>
                            {isMobile ? (
                                <div className="space-y-4">
                                    {penalties.data.map((penalty) => (
                                        <div key={penalty.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 mb-1">ID: {penalty.id}</p>
                                                    <h3 className="font-semibold text-base text-gray-800 mb-1">
                                                        {penalty.accountFirstName} {penalty.accountLastName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-1">@{penalty.accountUserName}</p>
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        Tarih: {penalty.issuedDate}
                                                    </p>
                                                    <p className="text-sm text-gray-700 mb-2">
                                                        <span className="font-medium">Neden:</span> {penalty.reason}
                                                    </p>
                                                    <p className="text-lg font-bold text-violet-600 mb-2">
                                                        {penalty.amount}₺
                                                    </p>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${penalty.isPaid ? "bg-green-500" : "bg-red-500"}`}>
                                                        {penalty.isPaid ? "Ödendi" : "Ödenmedi"}
                                                    </span>
                                                </div>
                                            </div>
                                            {!penalty.isPaid && (
                                                <button
                                                    onClick={() => handlePenaltyPaid(penalty.id!)}
                                                    className="w-full py-2 px-3 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition"
                                                >
                                                    <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />
                                                    Ödendi Olarak İşaretle
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-violet-400">
                                                <tr>
                                                    {!isMobile && (
                                                        <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                            Id
                                                        </th>
                                                    )}
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Ceza Verilen
                                                    </th>
                                                    {!isTablet && (
                                                        <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                            Tarih
                                                        </th>
                                                    )}
                                                    {!isTablet && (
                                                        <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                            Neden
                                                        </th>
                                                    )}
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Tutar
                                                    </th>
                                                    <th className="px-4 py-5 text-center text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Durum
                                                    </th>
                                                    <th className="px-4 py-5 text-center text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        İşlemler
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {penalties.data.map((penalty) => (
                                                    <tr key={penalty.id} className="hover:bg-gray-50">
                                                        {!isMobile && (
                                                            <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                                {penalty.id}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm md:text-base font-medium text-gray-900">
                                                                {penalty.accountFirstName} {penalty.accountLastName}
                                                            </div>
                                                            <div className="text-xs text-gray-500">@{penalty.accountUserName}</div>
                                                            {isTablet && (
                                                                <>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {penalty.issuedDate}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">{penalty.reason}</div>
                                                                </>
                                                            )}
                                                        </td>
                                                        {!isTablet && (
                                                            <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                                {penalty.issuedDate}
                                                            </td>
                                                        )}
                                                        {!isTablet && (
                                                            <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                                {penalty.reason}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-4 text-sm md:text-base font-semibold text-violet-600">
                                                            {penalty.amount}₺
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`inline-flex px-4 py-2 text-xs md:text-sm font-semibold rounded-full ${penalty.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                                }`}>
                                                                {penalty.isPaid ? "Ödendi" : "Ödenmedi"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex justify-center">
                                                                {!penalty.isPaid && (
                                                                    <button
                                                                        onClick={() => handlePenaltyPaid(penalty.id!)}
                                                                        title="Ödendi Olarak İşaretle"
                                                                        className="group relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 hover:scale-110 active:scale-95"
                                                                    >
                                                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                        <FontAwesomeIcon
                                                                            icon={faMoneyBill}
                                                                            className="relative z-10 text-sm md:text-base text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                                                                        />
                                                                        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-green-300 to-green-500 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                                                                    </button>
                                                                )}
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

                    <AdminPagination data={penalties.data} pagination={pagination} isLoading={penalties.isLoading} error={penalties.error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}