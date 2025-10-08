import { useEffect, useReducer } from "react";
import requests from "../../../../services/api";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import type Loan from "../../../../types/loan";
import { ClipLoader } from "react-spinners";
import BackendDataObjectReducer from "../../../../types/backendDataObject";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";

export default function LoanDetail() {
    const [loan, dispatch] = useReducer(BackendDataObjectReducer<Loan>, {
        data: null,
        isLoading: false,
        error: null
    });
    const { up } = useBreakpoint();
    const isMobile = !up.md;

    async function fetchLoan(id: string, signal: AbortSignal) {
        dispatch({ type: "FETCH_START" });
        try {
            const response = await requests.loan.getOneLoan(parseInt(id), signal);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data as Loan });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Kiralamalar listesi çekilirken bir hata oluştu" });
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        const id = window.location.pathname.split("/").pop();
        if (!id) throw new Error("Geçersiz kiralama ID'si");

        fetchLoan(id, controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    return (
    <div className="flex flex-col">
        <div className="flex flex-col md:flex-row mx-4 md:mx-8 lg:mx-20 gap-4">
            <p className="font-semibold text-xl md:text-2xl lg:text-4xl text-violet-500 h-fit border-none pb-2 mb-4 md:mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">
                {isMobile 
                    ? `${loan.data?.accountUserName} - Kiralama Detayları`
                    : `${loan.data?.accountUserName} kullanıcısının ${new Date(loan.data?.loanDate!).toLocaleDateString()} tarihinde yaptığı kiralamanın detayları`
                }
            </p>
            <div className="flex md:ml-auto">
                <Link to="/admin/loans" className="lg:self-center button font-bold text-sm md:text-lg hover:scale-105 duration-500 py-2">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Geri
                </Link>
            </div>
        </div>
        <div className="px-4 md:px-5 lg:px-20">
            <div className="lg:col-span-3 flex flex-col mt-4 md:mt-8 lg:mt-0">
                {(loan.isLoading) && (
                    <div className="flex justify-center items-center h-64">
                        <ClipLoader size={40} color="#8B5CF6" />
                    </div>
                )}

                {loan.error && (
                    <div className="flex justify-center items-center h-64 text-red-500 text-center px-4">
                        {loan.error}
                    </div>
                )}

                {loan.data && !loan.isLoading && (
                    <>
                        {isMobile ? (
                            <div className="space-y-4">
                                {loan.data.loanLines.map((line) => (
                                    <div key={line.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                        <div className="flex items-start gap-3 mb-3">
                                            <img 
                                                src={line.bookImageUrl} 
                                                alt={line.bookTitle} 
                                                className="w-20 h-auto rounded object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-base text-gray-800 mb-1">
                                                    {line.bookTitle}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    ISBN: {line.bookISBN}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Adet: {line.quantity}
                                                </p>
                                                <p className="text-sm font-semibold text-violet-600">
                                                    İşlem Ücreti: {line.quantity * 30} ₺
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="table-auto w-full border-collapse border border-gray-200">
                                        <thead>
                                            <tr className="bg-violet-400">
                                                <th className="text-white font-bold text-sm md:text-lg border border-gray-200 rounded-tl-lg px-4 py-4 md:py-6 text-center">Kitap Kapağı</th>
                                                <th className="text-white font-bold text-sm md:text-lg border border-gray-200 px-4 py-4 md:py-6 text-center">Kitap İsmi</th>
                                                <th className="text-white font-bold text-sm md:text-lg border border-gray-200 px-4 py-4 md:py-6 text-center">Kitap ISBN</th>
                                                <th className="text-white font-bold text-sm md:text-lg border border-gray-200 px-4 py-4 md:py-6 text-center">Adet</th>
                                                <th className="text-white font-bold text-sm md:text-lg border border-gray-200 rounded-tr-lg px-4 py-4 md:py-6 text-center">İşlem Ücreti</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loan.data.loanLines.map((line) => (
                                                <tr key={line.id} className="hover:bg-gray-50">
                                                    <td className="border-t border-violet-200 justify-center flex px-4 py-4 md:py-6">
                                                        <img src={line.bookImageUrl} alt={line.bookTitle} className="w-12 md:w-16 h-auto object-contain hover:scale-105 duration-500" />
                                                    </td>
                                                    <td className="text-gray-500 font-semibold text-sm md:text-lg border border-violet-200 px-4 py-4 md:py-6">{line.bookTitle}</td>
                                                    <td className="text-gray-500 font-semibold text-sm md:text-lg border border-violet-200 px-4 py-4 md:py-6">{line.bookISBN}</td>
                                                    <td className="text-gray-500 font-semibold text-sm md:text-lg border border-violet-200 px-4 py-4 md:py-6">{line.quantity}</td>
                                                    <td className="border-l border-t border-b border-violet-200 px-4 py-4 md:py-6 text-gray-500 font-semibold text-sm md:text-lg">{line.quantity * 30} ₺</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
);
}