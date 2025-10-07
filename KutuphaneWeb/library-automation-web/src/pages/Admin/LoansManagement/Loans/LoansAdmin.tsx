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
                displayStatus: loan.status == "OnLoan" ? "Kirada" : loan.status == "Returned" ? "İade Edildi" : loan.status == "Canceled" ? "İptal Edildi" : (loan.status == "Overdue" && loan.fineAmount == undefined )? "Gecikmiş (Cezasız)" : (loan.fineAmount == 0) ? "Gecikmiş (Ödendi)": "Gecikmiş (Cezalı)", 
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
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl  text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kiralama Yönetimi</p>
                <div className="flex flex-row ml-auto mr-auto content-center justify-center bg-white px-4 py-3 rounded-3xl shadow-lg mb-3 w-2/6">
                    <div className="flex flex-col w-full content-center justify-center relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 w-full text-base transform transition-all placeholder:text-gray-600 duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)] focus:scale-[102%] focus:bg-white/100"
                            placeholder="Kullanıcı adıyla kiralama ara.."
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
                    {(loans.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {loans.error && (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            {loans.error}
                        </div>
                    )}

                    {loans.data && !loans.isLoading && (
                        <div>
                            <table className="table-auto w-full border-collapse border border-gray-200 bg-white shadow-lg">
                                <thead>
                                    <tr className="bg-violet-400">
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tl-lg px-4 py-6 text-center">Id</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Kiralayan Bilgisi</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Kiralama Başlangıç- Bitiş</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Dönüş Tarihi</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Durum</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tr-lg px-4 py-6 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.data.map((loan) => (
                                        <tr key={loan.id} className="hover:bg-gray-50">
                                            <td className="text-gray-500 font-semibold text-lg border-t border-violet-200 px-4 py-6">{loan.id}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{loan.accountFirstName} {loan.accountLastName} ({loan.accountUserName})</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{loan.loanDate} - {loan.dueDate}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{loan.returnDate || "Yok"}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6 text-center"><p className={`rounded-full text-white shadow-md hover:scale-105 duration-500 py-1 ${loan.displayStatus == "Kirada" ? "bg-green-400" : loan.displayStatus == "İptal Edildi" ? "bg-red-400" : loan.displayStatus == "İade Edildi" ? "bg-violet-400" : "bg-yellow-400"}`}>{loan.displayStatus}</p></td>
                                            <td className="border-l border-t border-b border-violet-200 px-4 py-6">
                                                <div className="flex flex-row justify-center gap-x-2">
                                                    <Link to={`/admin/loans/${loan.id}`} title="Detaylar" className="bg-blue-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-blue-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="self-center" />
                                                    </Link>
                                                    {(loan.status == "OnLoan" || (loan.status == "Overdue" && loan.fineAmount == 0)) && <button onClick={() => handleLoanReturn(loan.id!)} title="İadeyi Onayla" className="bg-green-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-green-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faCheck} className="self-center" />
                                                    </button>}
                                                    {(loan.status == "Overdue" && loan.fineAmount == undefined) && <button onClick={() => handlePenaltyCreate(loan.id!)} title="Ceza Oluştur" className="bg-red-800 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-yellow-900 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faBan} className="self-center" />
                                                    </button>}
                                                    {(loan.status == "OnLoan" ) && <button onClick={() => handleLoanCancel(loan.id!)} title="İptal Et" className="bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-yellow-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faXmark} className="self-center" />
                                                    </button>}
                                                    {loan.status == "Canceled" && <button onClick={() => handleLoanDelete(loan.id!)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faTrash} className="self-center" />
                                                    </button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <AdminPagination data={loans.data} pagination={pagination} isLoading={loans.isLoading} error={loans.error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}