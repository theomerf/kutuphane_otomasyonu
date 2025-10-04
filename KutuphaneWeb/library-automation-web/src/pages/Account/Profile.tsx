import { useEffect, useReducer, useState } from "react";
import type Account from "../../types/account";
import BackendDataObjectReducer from "../../types/backendDataObject";
import BackendDataListReducer from "../../types/backendDataList";
import type Loan from "../../types/loan";
import type UserReview from "../../types/userReview";
import requests from "../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCalendar, faCameraAlt, faChevronDown, faEdit, faQuestion, faTrash } from "@fortawesome/free-solid-svg-icons";
import type ReservationResponse from "../../types/reservation";
import { Link } from "react-router-dom";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { Rating } from "../../components/ui/Rating";

type userStats = {
    totalLoans: number;
    totalReservations: number;
    totalReviews: number;
}

export default function Profile() {
    const sectionsInitialState = new Map<string, boolean>([
        ["loans", false],
        ["userReviews", false],
        ["reservations", false]
    ]);
    const [userStats, setUserStats] = useState<userStats>({ totalLoans: 0, totalReservations: 0, totalReviews: 0 });
    const [sections, setSections] = useState<Map<string, boolean>>(sectionsInitialState);
    const [loanDetailsOpen, setLoanDetailsOpen] = useState<Record<number, boolean>>({});
    const [userDetails, userDetailsDispatch] = useReducer(BackendDataObjectReducer<Account>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [loans, loansDispatch] = useReducer(BackendDataListReducer<Loan>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [userReviews, userReviewsDispatch] = useReducer(BackendDataListReducer<UserReview>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [reservations, reservationsDispatch] = useReducer(BackendDataListReducer<ReservationResponse>, {
        data: null,
        isLoading: false,
        error: null
    });
    const { up } = useBreakpoint();

    const fetchUserDetails = async (signal: AbortSignal) => {
        userDetailsDispatch({ type: "FETCH_START" });
        try {
            const response = await requests.account.getAccountDetails(signal);
            const parsedResponse = {
                ...response.data,
                displayMembershipDate: new Date(response.data.membershipDate!).toLocaleDateString("tr-TR"),
                displayBirthDate: response.data.birthDate ? new Date(response.data.birthDate).toLocaleDateString("tr-TR") : undefined,
                displayLastLoginDate: response.data.lastLoginDate ? new Date(response.data.lastLoginDate).toLocaleDateString("tr-TR") : undefined
            }
            userDetailsDispatch({ type: "FETCH_SUCCESS", payload: parsedResponse as Account });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                userDetailsDispatch({ type: "FETCH_ERROR", payload: error.message || "Kullanıcı bilgileri yüklenirken bir hata oluştu." });
            }
        }
    };

    const fetchLoans = async (signal: AbortSignal) => {
        try {
            const response = await requests.loan.getAllLoansOfUser(signal);
            const parsedResponse = response.data.map((loan: Loan) => ({
                ...loan,
                loanDate: new Date(loan.loanDate!).toLocaleDateString("tr-TR"),
                dueDate: new Date(loan.dueDate!).toLocaleDateString("tr-TR"),
                returnDate: loan.returnDate ? new Date(loan.returnDate).toLocaleDateString("tr-TR") : null,
                displayStatus: loan.status == "OnLoan" ? "Kirada" : loan.status == "Returned" ? "İade Edildi" : loan.status == "Canceled" ? "İptal Edildi" : loan.status == "Overdue" ? "Gecikmiş" : loan.status
            }));
            loansDispatch({ type: "FETCH_SUCCESS", payload: parsedResponse as Loan[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                loansDispatch({ type: "FETCH_ERROR", payload: error.message || "Kullanıcı ödünç aldığı kitaplar yüklenirken bir hata oluştu." });
            }
        }
    };

    const fetchUserReviews = async (signal: AbortSignal) => {
        try {
            const response = await requests.userReview.getAllUserReviewsOfUser(signal);
            userReviewsDispatch({ type: "FETCH_SUCCESS", payload: response.data as UserReview[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                userReviewsDispatch({ type: "FETCH_ERROR", payload: error.message || "Kullanıcı yorumları yüklenirken bir hata oluştu." });
            }
        }
    };

    const fetchReservations = async (signal: AbortSignal) => {
        try {
            const response = await requests.reservation.getAllReservationsOfUser(signal);
            const parsedResponse = response.data.map((res: ReservationResponse) => ({
                ...res,
                displayReservationDate: new Date(res.reservationDate).toLocaleDateString("tr-TR"),
                displayStatus: res.status === "Active" ? "Aktif" :
                    res.status === "Cancelled" ? "İptal Edildi" :
                        res.status === "Completed" ? "Tamamlandı" :
                            res.status === "Expired" ? "Süresi Doldu" :
                                res.status,
            }));
            reservationsDispatch({ type: "FETCH_SUCCESS", payload: parsedResponse as ReservationResponse[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                reservationsDispatch({ type: "FETCH_ERROR", payload: error.message || "Kullanıcı rezervasyonları yüklenirken bir hata oluştu." });
            }
        }
    };

    const fetchUserStats = async (signal: AbortSignal) => {
        try {
            const [loansResponse, reservationsResponse, reviewsResponse] = await Promise.all([
                requests.loan.getAllLoansCountOfUser(signal),
                requests.reservation.getAllReservationsCountOfUser(signal),
                requests.userReview.getAllUserReviewsCountOfUser(signal)
            ]);
            setUserStats({
                totalLoans: loansResponse.data,
                totalReservations: reservationsResponse.data,
                totalReviews: reviewsResponse.data
            });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                console.error("Kullanıcı istatistikleri yüklenirken bir hata oluştu.", error);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchUserDetails(controller.signal);
        fetchUserStats(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        if (sections.get("loans")) {
            fetchLoans(controller.signal);
        }
        if (sections.get("userReviews")) {
            fetchUserReviews(controller.signal);
        }
        if (sections.get("reservations")) {
            fetchReservations(controller.signal);
        }
    }, [sections]);

    return (
        <div className="flex flex-col gap-y-8">
            <p className="font-semibold text-4xl ml-8 lg:ml-20 text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Profilim</p>
            <div className="grid grid-cols-3 lg:gap-x-20 px-5 lg:px-20">
                <div className="col-span-1 px-4 py-10 cardBefore">
                    {(userDetails.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {userDetails.error && (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            Kullanıcı bilgileri yüklenirken bir hata oluştu.
                        </div>
                    )}

                    {userDetails.data && !userDetails.isLoading && (
                        <div className="flex flex-col gap-y-4">
                            <p className="text-violet-400 font-semibold text-2xl text-center">Profil Fotoğrafı</p>
                            <div className="h-60 w-60 self-center rounded-full relative shadow-md border border-violet-400">
                                <img src={"https://localhost:7214/images/" + userDetails.data.avatarUrl} className="object-contain hover:scale-[102%] duration-500" />
                                <button title="Fotoğraf Yükle" className="absolute right-0 bottom-0 hover:scale-110 duration-500">
                                    <FontAwesomeIcon icon={faCameraAlt} title="Fotoğraf Yükle" className=" text-violet-500 text-3xl" />
                                </button>

                            </div>
                            <div className="flex flex-col gap-y-2 border border-gray-200 rounded-lg p-4 m-4 shadow-md bg-violet-50">
                                <div className="flex flex-row gap-x-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">Ad Soyad:</p>
                                    <p className="text-gray-400 font-medium text-lg">{userDetails.data.firstName} {userDetails.data.lastName}</p>
                                </div>
                                <div className="flex flex-row gap-y-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">Kullanıcı Adı</p>
                                    <p className="text-gray-400 font-medium text-lg">{userDetails.data.userName}</p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
                <div className="col-span-2 flex flex-col gap-y-4 px-4 py-10 cardBefore">
                    {(userDetails.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {userDetails.error && (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            {userDetails.error}
                        </div>
                    )}
                    {userDetails.data && !userDetails.isLoading && (
                        <div className="flex flex-col gap-y-4">
                            <p className="text-violet-400 font-semibold text-2xl text-center">Profil Detayları</p>
                            <div className="flex flex-col gap-y-3 border border-gray-200 rounded-lg p-4 m-4 shadow-md bg-violet-50">
                                <div className="flex flex-row gap-x-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">E-Posta Adresi:</p>
                                    <p className="text-gray-400 font-medium text-lg">{userDetails.data.email}</p>
                                </div>
                                <div className="flex flex-row gap-y-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">Telefon Numarası:</p>
                                    <p className="text-gray-400 font-medium text-lg">{userDetails.data.phoneNumber}</p>
                                </div>
                                <div className="flex flex-row gap-y-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">Üyelik Tarihi:</p>
                                    <p className="text-gray-400 font-medium text-lg">{userDetails.data.displayMembershipDate}</p>
                                </div>
                                <div className="flex flex-row gap-y-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">Doğum Tarihi:</p>
                                    <p className="text-gray-400 font-medium text-lg">{userDetails.data.displayBirthDate ?? "Belirtilmedi"}</p>
                                </div>
                                <div className="flex flex-row gap-y-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">Son Giriş Tarihi:</p>
                                    <p className="text-gray-400 font-medium text-lg">{userDetails.data.displayLastLoginDate ?? "Belirtilmedi"}</p>
                                </div>
                                <div className="flex flex-row gap-y-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">Toplam Değerlendirme Sayısı:</p>
                                    <p className="text-gray-400 font-medium text-lg">{userStats.totalReviews}</p>
                                </div>
                                <div className="flex flex-row gap-y-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">Toplam Kiralama Sayısı:</p>
                                    <p className="text-gray-400 font-medium text-lg">{userStats.totalLoans}</p>
                                </div>
                                <div className="flex flex-row gap-y-1 justify-between">
                                    <p className="text-violet-400 font-semibold text-xl">Toplam Rezervasyon Sayısı:</p>
                                    <p className="text-gray-400 font-medium text-lg">{userStats.totalReservations}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col cardBefore mx-5 lg:mx-20">
                <div className="flex flex-row py-2 relative justify-center">
                    <p className="text-violet-400 font-semibold text-2xl my-2">Kiralamalar</p>
                    <button className="absolute right-0">
                        <FontAwesomeIcon icon={faChevronDown} className={`text-white w-6 h-6 rounded-full p-1 mx-1 my-2 bg-violet-400 text-2xl hover:scale-110 duration-500 ${sections.get("loans") ? "rotate-180" : ""}`} onClick={() => {
                            const newSections = new Map(sections);
                            newSections.set("loans", !sections.get("loans"));
                            setSections(newSections);
                        }} />
                    </button>
                </div>

                {sections.get("loans") && (
                    <>
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
                            <div className="gap-y-3 px-4 pb-10 max-h-[400px] overflow-y-auto">
                                {loans.data.length === 0 ? (
                                    <div className="flex flex-col justify-center text-center">
                                        <FontAwesomeIcon icon={faQuestion} className="text-violet-400 animate-pulse text-6xl text-center mt-10 mb-4 self-center" />
                                        <p className="text-gray-400 font-medium text-lg text-center">Henüz kitap kiralamadınız.</p>
                                        <Link to="/books" className="self-center mt-4 button hover:scale-105 duration-500 transition-all">Kitaplara Göz At</Link>
                                    </div>
                                ) : (
                                    loans.data.map((loan) => (
                                        <div key={loan.id} className="rounded-lg shadow-md border bg-violet-50 border-gray-200 px-8 py-6 mb-6">
                                            <div className="flex flex-row items-center">
                                                <div>
                                                    <div className="flex flex-row gap-x-2">
                                                        <p className="text-lg text-gray-400 font-semibold self-center"><span className="font-bold text-violet-500">Kiralama Tarihi: </span>{loan.loanDate}</p>
                                                        <p className="text-lg text-gray-400 font-semibold self-center"><span className="font-bold text-violet-500">Teslim Beklenen Tarih: </span>{loan.dueDate}</p>
                                                    </div>
                                                    <div className="flex flex-row gap-x-2">
                                                        <p className="text-lg text-gray-400 font-semibold self-center"><span className="font-bold text-violet-500">Kitap Sayısı: </span>{loan.loanLines.length}</p>
                                                        {loan.returnDate && <p className="text-lg text-gray-400 font-semibold self-center"><span className="font-bold text-violet-500">İade Tarihi: </span>{loan.returnDate}</p>}
                                                    </div>
                                                    {loan.fineAmount && <p className="text-red-500"><span className="font-bold text-violet-500">Ceza: </span>{loan.fineAmount}₺</p>}
                                                </div>

                                                <div className="flex flex-row gap-x-4 ml-auto">
                                                    <p className={`rounded-full px-4 self-center text-white shadow-md hover:scale-105 duration-500 py-2 ${loan.displayStatus == "Kirada" ? "bg-green-400" : loan.displayStatus == "İptal Edildi" ? "bg-red-400" : loan.displayStatus == "İade Edildi" ? "bg-violet-400" : "bg-yellow-400"}`}>{loan.displayStatus}</p>
                                                    <button
                                                        className="ml-auto"
                                                        onClick={() =>
                                                            setLoanDetailsOpen(prev => ({
                                                                ...prev,
                                                                [loan.id!]: !prev[loan.id!]
                                                            }))
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faChevronDown}
                                                            className={`text-violet-400 w-6 h-6 rounded-full p-1 mx-1 my-2 bg-violet-100 hover:scale-110 duration-500 ${loanDetailsOpen[loan.id!] ? "rotate-180" : ""}`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            {loanDetailsOpen[loan.id!] && (
                                                <div className="mt-4 border-t pt-4">
                                                    {loan.loanLines.length > 0 ? (
                                                        loan.loanLines.map(line => (
                                                            <div key={line.id} className="flex flex-row items-center gap-x-6 mb-4">
                                                                <img src={line.bookImageUrl?.includes("books") ? `https://localhost:7214/images/${line.bookImageUrl}` : `${line.bookImageUrl}`}
                                                                    className="h-20 object-contain rounded-md border shadow-sm hover:scale-105 duration-500" />
                                                                <div>
                                                                    <p className="font-bold">{line.bookTitle}</p>
                                                                    <p className="text-gray-400 text-sm">ISBN: {line.bookISBN}</p>
                                                                    <p className="text-gray-400 text-sm">Adet: {line.quantity}</p>
                                                                    <p className="text-gray-400 text-sm">Mevcut: {line.availableCopies}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-400">Satır yok.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}</>
                )}
            </div>

            <div className="flex flex-col cardBefore mx-5 lg:mx-20">
                <div className="flex flex-row py-2 relative justify-center">
                    <p className="text-violet-400 font-semibold text-2xl my-2">Kitap Değerlendirmeleri</p>
                    <button className="absolute right-0">
                        <FontAwesomeIcon icon={faChevronDown} className={`text-white w-6 h-6 rounded-full p-1 mx-1 my-2 bg-violet-400 text-2xl hover:scale-110 duration-500 ${sections.get("userReviews") ? "rotate-180" : ""}`} onClick={() => {
                            const newSections = new Map(sections);
                            newSections.set("userReviews", !sections.get("userReviews"));
                            setSections(newSections);
                        }} />
                    </button>
                </div>

                {sections.get("userReviews") && (
                    <>
                        {(userReviews.isLoading) && (
                            <div className="flex justify-center items-center h-64">
                                <ClipLoader size={40} color="#8B5CF6" />
                            </div>
                        )}

                        {userReviews.error && (
                            <div className="flex justify-center items-center h-64 text-red-500">
                                {loans.error}
                            </div>
                        )}

                        {userReviews.data && !userReviews.isLoading && (
                            <div className="gap-y-3 px-4 pb-10 max-h-[400px] overflow-y-auto">
                                {userReviews.data.length === 0 ? (
                                    <div className="flex flex-col justify-center text-center">
                                        <FontAwesomeIcon icon={faQuestion} className="text-violet-400 animate-pulse text-6xl text-center mt-10 mb-4 self-center" />
                                        <p className="text-gray-400 font-medium text-lg text-center">Henüz değerlendirme yapmadınız.</p>
                                        <Link to={`/books/${Math.floor(Math.random() * 102)}`} className="self-center mt-4 button hover:scale-105 duration-500 transition-all">Rastgele bir kitabı incele</Link>
                                    </div>
                                ) : (
                                    userReviews.data.map((review) => (
                                        <div key={review.id} className={`${up.lg ? "hover:bg-gray-100 hover:translate-x-2 hover:before:content-[''] hover:before:top-0 hover:before:absolute hover:before:left-0 hover:before:bottom-0 hover:before:w-1 hover:before:bg-hero-gradient hover:duration-500 duration-500 group" : ""} flex flex-col gap-y-6 rounded-lg shadow-md border bg-violet-50 border-gray-200 px-8 py-6 mb-6`}>
                                            <div className="flex flex-row">
                                                <p className="text-lg text-gray-400 font-semibold self-center"><span className="font-bold text-violet-500">Kitap Adı:</span> {review.bookTitle}</p>
                                                <div className="flex flex-row gap-x-2 ml-4">
                                                    <button title="Düzenle" className="bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-8 h-8 hover:scale-105 hover:bg-yellow-600 duration-500 text-base">
                                                        <FontAwesomeIcon icon={faEdit} className="self-center" />
                                                    </button>
                                                    <button title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-8 h-8 hover:scale-105 hover:bg-red-600 duration-500 text-base">
                                                        <FontAwesomeIcon icon={faTrash} className="self-center" />
                                                    </button>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="mr-6">
                                                        <FontAwesomeIcon icon={faCalendar} className="text-violet-400 mr-2" />
                                                        {review.createdAt.toString().split('T')[0]}
                                                    </span>
                                                    <Rating rating={review.rating} />
                                                </div>
                                            </div>
                                            {review.comment &&
                                                <div className="rounded-lg border-gray-200 border-2 bg-white px-4 py-8">
                                                    {review.comment}
                                                </div>
                                            }
                                        </div>
                                    ))
                                )}
                            </div>
                        )}</>
                )}
            </div>

            <div className="flex flex-col cardBefore mx-5 lg:mx-20">
                <div className="flex flex-row py-2 relative justify-center">
                    <p className="text-violet-400 font-semibold text-2xl my-2">Rezervasyonlar</p>
                    <button className="absolute right-0">
                        <FontAwesomeIcon icon={faChevronDown} className={`text-white w-6 h-6 rounded-full p-1 mx-1 my-2 bg-violet-400 text-2xl hover:scale-110 duration-500 ${sections.get("reservations") ? "rotate-180" : ""}`} onClick={() => {
                            const newSections = new Map(sections);
                            newSections.set("reservations", !sections.get("reservations"));
                            setSections(newSections);
                        }} />
                    </button>
                </div>

                {sections.get("reservations") && (
                    <>
                        {(reservations.isLoading) && (
                            <div className="flex justify-center items-center h-64">
                                <ClipLoader size={40} color="#8B5CF6" />
                            </div>
                        )}

                        {reservations.error && (
                            <div className="flex justify-center items-center h-64 text-red-500">
                                {reservations.error}
                            </div>
                        )}

                        {reservations.data && !reservations.isLoading && (
                            <div className="gap-y-3 px-4 pb-10 max-h-[400px] overflow-y-auto">
                                {reservations.data.length === 0 ? (
                                    <div className="flex flex-col justify-center text-center">
                                        <FontAwesomeIcon icon={faQuestion} className="text-violet-400 animate-pulse text-6xl text-center mt-10 mb-4 self-center" />
                                        <p className="text-gray-400 font-medium text-lg text-center">Henüz kitap kiralamadınız.</p>
                                        <Link to="/books" className="self-center mt-4 button hover:scale-105 duration-500 transition-all">Kitaplara Göz At</Link>
                                    </div>
                                ) : (
                                    reservations.data.map((res) => (
                                        <div key={res.id} className={`${up.lg ? "hover:bg-gray-100 hover:translate-x-2 hover:before:content-[''] hover:before:top-0 hover:before:absolute hover:before:left-0 hover:before:bottom-0 hover:before:w-1 hover:before:bg-hero-gradient hover:duration-500 duration-500 group" : ""} flex flex-row gap-x-6 rounded-lg shadow-md border bg-violet-50 border-gray-200 px-8 py-6 mb-6`}>
                                            <div>
                                                <p className="text-lg text-gray-400 font-semibold self-center"><span className="font-bold text-violet-500">Tarih:</span> {res.displayReservationDate}</p>
                                                <p className="text-lg text-gray-400 font-semibold self-center"><span className="font-bold text-violet-500">Saat Aralığı:</span> {res.timeSlotStartTime} - {res.timeSlotEndTime}</p>
                                            </div>
                                            <div className="flex flex-row gap-x-4 ml-auto">
                                                <p className={`rounded-full self-center px-4 text-white shadow-md hover:scale-105 duration-500 py-2 ${res.displayStatus == "Aktif" ? "bg-green-400" : res.displayStatus == "İptal Edildi" ? "bg-red-400" : res.displayStatus == "Tamamlandı" ? "bg-violet-400" : "bg-gray-400"}`}>{res.displayStatus}</p>
                                                {res.status == "Active" && <button title="İptal Et" className="self-center bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-8 h-8 hover:scale-105 hover:bg-red-600 duration-500 text-base">
                                                    <FontAwesomeIcon icon={faBan} className="self-center" />
                                                </button>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}</>
                )}
            </div>
        </div>
    );
}