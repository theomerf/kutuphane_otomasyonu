import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import requests from "../../../../services/api";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBan, faCheck, faMagnifyingGlass, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import type Loan from "../../../../types/loan";
import { ClipLoader } from "react-spinners";
import type { RequestParameters } from "../../../../types/bookRequestParameters";
import type PaginationHeader from "../../../../types/paginationHeader";
import { useDebounce } from "../../../../hooks/useDebounce";
import AdminPagination from "../../../../components/ui/AdminPagination";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";
import BackendDataListReducer from "../../../../types/backendDataList";
import type Penalty from "../../../../types/penalty";


export default function LoansAdmin() {
    const [loans, dispatch] = useReducer(BackendDataListReducer<Loan>, {
        data: [],
        isLoading: false,
        error: null
    });
    const [refreshLoans, setRefreshLoans] = useState(0);
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

    async function fetchLoans(queryParams: RequestParameters, signal: AbortSignal) {
        dispatch({ type: "FETCH_START" });

        try {
            const queryString = new URLSearchParams();

            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryString.append(key, value.toString());
                }
            });
            const response = await requests.loan.getAllLoans(queryString, signal);
            const parsedResponse = response.data.map((loan: Loan) => ({
                ...loan,
                loanDate: new Date(loan.loanDate!).toLocaleDateString("tr-TR"),
                dueDate: new Date(loan.dueDate!).toLocaleDateString("tr-TR"),
                returnDate: loan.returnDate ? new Date(loan.returnDate).toLocaleDateString("tr-TR") : null,
                displayStatus: loan.status == "OnLoan" ? "Kirada" : loan.status == "Returned" ? "İade Edildi" : loan.status == "Canceled" ? "İptal Edildi" : (loan.status == "Overdue" && loan.fineAmount == undefined) ? "Gecikmiş (Cezasız)" : (loan.fineAmount == 0) ? "Gecikmiş (Ödendi)" : "Gecikmiş (Cezalı)",
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
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Kiralamalar çekilirken bir hata oluştu" });
            }
        }
    };

    const handleLoanDelete = async (id: number) => {
        if (!window.confirm("Bu kiralamayı silmek istediğinize emin misiniz?")) return;
        try {
            await requests.loan.deleteLoan(id);
            toast.success("Kiralama başarıyla silindi.");
            setRefreshLoans(prev => prev + 1);
        }
        catch (error) {
            console.error(error);
            toast.error("Kiralama silinirken hata oluştu.");
        }
    };

    const handleLoanCancel = async (id: number) => {
        if (!window.confirm("Bu kiralamayı iptal etmek istediğinize emin misiniz?")) return;
        try {
            await requests.loan.cancelLoan(id);
            toast.success("Kiralama başarıyla iptal edildi.");
            setRefreshLoans(prev => prev + 1);
        }
        catch (error) {
            console.error(error);
            toast.error("Kiralama iptal edilirken hata oluştu.");
        }
    };

    const handleLoanReturn = async (id: number) => {
        if (!window.confirm("Bu kiralamanın geri teslim edildiğini onaylamak istediğinize emin misiniz?")) return;
        try {
            await requests.loan.returnLoan(id);
            toast.success("Kiralama başarıyla iade olarak işaretlendi.");
            setRefreshLoans(prev => prev + 1);
        }
        catch (error) {
            console.error(error);
            toast.error("Kiralama iade edilirken hata oluştu.");
        }
    };

    const handlePenaltyCreate = async (id: number) => {
        if (!window.confirm("Bu kullanıcıya ceza oluşturmak istediğinize emin misiniz?")) return;
        try {
            const penalty: Penalty = {
                amount: 50,
                reason: "Gecikmiş iade",
                issuedDate: new Date().toISOString(),
                loanId: id,
            }
            await requests.penalty.createPenalty(penalty);
            toast.success("Ceza başarıyla oluşturuldu.");
            setRefreshLoans(prev => prev + 1);
        }
        catch (error: any) {
            console.error(error);
            toast.error("Ceza oluşturulurken hata oluştu.");
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchLoans(finalQuery, controller.signal);

        return () => {
            controller.abort();
        };
    }, [finalQuery, refreshLoans]);

    useEffect(() => {
        modifyUrl();
    }, [finalQuery]);

    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex-col md:flex-row mx-4 md:mx-8 lg:mx-20 gap-4">
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-4 md:mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">
                    {isMobile ? 'Kiralamalar' : 'Kiralama Yönetimi'}
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
                    {(loans.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {loans.error && (
                        <div className="flex justify-center items-center h-64 text-red-500 text-center px-4">
                            {loans.error}
                        </div>
                    )}

                    {loans.data && !loans.isLoading && (
                        <>
                            {isMobile ? (
                                <div className="space-y-4">
                                    {loans.data.map((loan) => (
                                        <div key={loan.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 mb-1">ID: {loan.id}</p>
                                                    <h3 className="font-semibold text-base text-gray-800 mb-1">
                                                        {loan.accountFirstName} {loan.accountLastName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-1">@{loan.accountUserName}</p>
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        {loan.loanDate} - {loan.dueDate}
                                                    </p>
                                                    {loan.returnDate && (
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            Dönüş: {loan.returnDate}
                                                        </p>
                                                    )}
                                                    <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${loan.displayStatus === "Kirada" ? "bg-green-400" : loan.displayStatus === "İptal Edildi" ? "bg-red-400" : loan.displayStatus === "İade Edildi" ? "bg-violet-400" : "bg-yellow-400"}`}>
                                                        {loan.displayStatus}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <Link
                                                    to={`/admin/loans/${loan.id}`}
                                                    className="flex-1 min-w-[100px] py-2 px-3 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition text-center"
                                                >
                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-1" />
                                                    Detay
                                                </Link>
                                                {(loan.status === "OnLoan" || (loan.status === "Overdue" && loan.fineAmount === 0)) && (
                                                    <button
                                                        onClick={() => handleLoanReturn(loan.id!)}
                                                        className="flex-1 min-w-[100px] py-2 px-3 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition"
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                                        İade
                                                    </button>
                                                )}
                                                {(loan.status === "Overdue" && loan.fineAmount === undefined) && (
                                                    <button
                                                        onClick={() => handlePenaltyCreate(loan.id!)}
                                                        className="flex-1 min-w-[100px] py-2 px-3 bg-red-800 text-white rounded text-sm font-medium hover:bg-red-900 transition"
                                                    >
                                                        <FontAwesomeIcon icon={faBan} className="mr-1" />
                                                        Ceza
                                                    </button>
                                                )}
                                                {loan.status === "OnLoan" && (
                                                    <button
                                                        onClick={() => handleLoanCancel(loan.id!)}
                                                        className="flex-1 min-w-[100px] py-2 px-3 bg-yellow-500 text-white rounded text-sm font-medium hover:bg-yellow-600 transition"
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} className="mr-1" />
                                                        İptal
                                                    </button>
                                                )}
                                                {loan.status === "Canceled" && (
                                                    <button
                                                        onClick={() => handleLoanDelete(loan.id!)}
                                                        className="flex-1 min-w-[100px] py-2 px-3 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                        Sil
                                                    </button>
                                                )}
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
                                                    {!isMobile && (
                                                        <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                            Id
                                                        </th>
                                                    )}
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Kiralayan
                                                    </th>
                                                    {!isTablet && (
                                                        <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                            Başlangıç-Bitiş
                                                        </th>
                                                    )}
                                                    {!isTablet && (
                                                        <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                            Dönüş
                                                        </th>
                                                    )}
                                                    <th className="px-4 py-5 text-center text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Durum
                                                    </th>
                                                    <th className="px-4 py-5 text-center text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        İşlemler
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {loans.data.map((loan) => (
                                                    <tr key={loan.id} className="hover:bg-gray-50">
                                                        {!isMobile && (
                                                            <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                                {loan.id}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm md:text-base font-medium text-gray-900">
                                                                {loan.accountFirstName} {loan.accountLastName}
                                                            </div>
                                                            <div className="text-xs text-gray-500">@{loan.accountUserName}</div>
                                                            {isTablet && (
                                                                <>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {loan.loanDate} - {loan.dueDate}
                                                                    </div>
                                                                    {loan.returnDate && (
                                                                        <div className="text-xs text-gray-500">Dönüş: {loan.returnDate}</div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </td>
                                                        {!isTablet && (
                                                            <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                                {loan.loanDate} - {loan.dueDate}
                                                            </td>
                                                        )}
                                                        {!isTablet && (
                                                            <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                                {loan.returnDate || "Yok"}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`inline-flex px-4 py-2 text-xs md:text-sm font-semibold rounded-full ${loan.displayStatus === "Kirada" ? "bg-green-100 text-green-800" :
                                                                loan.displayStatus === "İptal Edildi" ? "bg-red-100 text-red-800" :
                                                                    loan.displayStatus === "İade Edildi" ? "bg-violet-100 text-violet-800" :
                                                                        "bg-yellow-100 text-yellow-800"
                                                                }`}>
                                                                {loan.displayStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex justify-center gap-2">
                                                                <Link
                                                                    to={`/admin/loans/${loan.id}`}
                                                                    title="İncele"
                                                                    className="group relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-110 active:scale-95"
                                                                >
                                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                    <FontAwesomeIcon
                                                                        icon={faMagnifyingGlass}
                                                                        className="relative z-10 text-sm md:text-base text-white drop-shadow-sm group-hover:scale-125 transition-transform duration-300"
                                                                    />
                                                                    <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-300 to-blue-500 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                                                                </Link>

                                                                {(loan.status === "OnLoan" || (loan.status === "Overdue" && loan.fineAmount === 0)) && (
                                                                    <button
                                                                        onClick={() => handleLoanReturn(loan.id!)}
                                                                        title="İade Olarak İşaretle"
                                                                        className="group relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 hover:scale-110 active:scale-95"
                                                                    >
                                                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                        <FontAwesomeIcon
                                                                            icon={faCheck}
                                                                            className="relative z-10 text-sm md:text-base text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                                                                        />
                                                                        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-green-300 to-green-500 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                                                                    </button>
                                                                )}

                                                                {(loan.status === "Overdue" && loan.fineAmount === undefined) && (
                                                                    <button
                                                                        onClick={() => handlePenaltyCreate(loan.id!)}
                                                                        title="Ceza Oluştur"
                                                                        className="group relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg bg-gradient-to-br from-red-700 via-red-800 to-red-900 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-red-800/50 hover:scale-110 active:scale-95"
                                                                    >
                                                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                        <FontAwesomeIcon
                                                                            icon={faBan}
                                                                            className="relative z-10 text-sm md:text-base text-white drop-shadow-sm group-hover:rotate-12 transition-transform duration-300"
                                                                        />
                                                                        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-600 to-red-800 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                                                                    </button>
                                                                )}

                                                                {loan.status === "OnLoan" && (
                                                                    <button
                                                                        onClick={() => handleLoanCancel(loan.id!)}
                                                                        title="İptal Et"
                                                                        className="group relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/50 hover:scale-110 active:scale-95"
                                                                    >
                                                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                        <FontAwesomeIcon
                                                                            icon={faXmark}
                                                                            className="relative z-10 text-sm md:text-base text-white drop-shadow-sm group-hover:rotate-90 transition-transform duration-300"
                                                                        />
                                                                        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                                                                    </button>
                                                                )}

                                                                {loan.status === "Canceled" && (
                                                                    <button
                                                                        onClick={() => handleLoanDelete(loan.id!)}
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

                    <AdminPagination data={loans.data} pagination={pagination} isLoading={loans.isLoading} error={loans.error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}