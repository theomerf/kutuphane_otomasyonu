import { useEffect, useReducer, useState } from "react";
import type Account from "../../types/account";
import BackendDataObjectReducer from "../../types/backendDataObject";
import BackendDataListReducer from "../../types/backendDataList";
import type Loan from "../../types/loan";
import type UserReview from "../../types/userReview";
import requests from "../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBan, faCakeCandles, faCheck, faChevronDown, faEdit, faEnvelope, faInfo, faPhone, faQuestion, faUser } from "@fortawesome/free-solid-svg-icons";
import type ReservationResponse from "../../types/reservation";
import { Link } from "react-router-dom";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ProfileReviews from "../../components/profile/ProfileReviews";
import ProfileAvatar from "../../components/profile/ProfileAvatar";

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
    const [refreshComments, setRefreshComments] = useState(0);
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
    const { register, handleSubmit, formState: { errors }, reset, clearErrors } = useForm();
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [refreshUserDetails, setRefreshUserDetails] = useState(0);
    const [refreshReservations, setRefreshReservations] = useState(0);

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
    }, [refreshUserDetails]);

    useEffect(() => {
        const controller = new AbortController();

        if (sections.get("loans")) {
            fetchLoans(controller.signal);
        }
    }, [sections]);

    useEffect(() => {
        const controller = new AbortController();

        if (sections.get("reservations")) {
            fetchReservations(controller.signal);
        }
    }, [sections, refreshReservations]);

    useEffect(() => {
        const controller = new AbortController();

        if (sections.get("userReviews")) {
            fetchUserReviews(controller.signal);
        }
    }, [sections, refreshComments]);

    const handleReservationCancel = async (id: number) => {
        if (!window.confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            await requests.reservation.cancelReservationForUser(id);
            setRefreshReservations(prev => prev + 1);
            toast.success("Rezervasyon başarıyla iptal edildi.");
        }
        catch (error: any) {
            console.error("Rezervasyon iptal edilirken bir hata oluştu.", error);
            toast.error("Rezervasyon iptal edilirken bir hata oluştu.");
        }
    }

    const handleProfileUpdate = async (formData: any) => {
        try {
            setEditProfileOpen(false);
            await requests.account.updateAccountForUser(formData);
            setRefreshUserDetails(prev => prev + 1);
            toast.success("Profil başarıyla güncellendi.");
        }
        catch (error: any) {
            console.error("Profil güncellenirken bir hata oluştu.", error);
            toast.error("Profil güncellenirken bir hata oluştu.");
        }
    };

    useEffect(() => {
        clearErrors();
        if (userDetails.data) {
            reset({
                Id: userDetails.data.id,
                UserName: userDetails.data.userName,
                FirstName: userDetails.data.firstName,
                LastName: userDetails.data.lastName,
                Email: userDetails.data.email,
                PhoneNumber: userDetails.data.phoneNumber,
                BirthDate: userDetails.data.birthDate ? new Date(userDetails.data.birthDate).toISOString().split('T')[0] : ''
            });
        }
    }, [editProfileOpen]);


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
                            <ProfileAvatar userDetails={userDetails} setRefreshUserDetails={setRefreshUserDetails} />
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
                            <div className="flex flex-row mx-4">
                                <p className="ml-auto text-violet-400 font-semibold text-2xl text-center">Profil Detayları</p>
                                <button onClick={() => setEditProfileOpen(true)} title="Düzenle" className="ml-auto bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-8 h-8 hover:scale-105 hover:bg-yellow-600 duration-500 text-base">
                                    <FontAwesomeIcon icon={faEdit} className="self-center" />
                                </button>
                            </div>
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

            {editProfileOpen && (
                <div className="fixed px-5 lg:px-0 inset-0 lg:inset-0 mt-20 overflow-auto lg:mt-20 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="flex flex-col bg-white rounded-3xl shadow-lg">
                        <div className="bg-violet-400 py-2 lg:py-6 flex flex-col text-center gap-y-1 px-10 lg:px-14 rounded-tr-3xl rounded-tl-3xl">
                            <p className="font-bold text-lg lg:text-xl text-white">
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Profili Düzenle
                            </p>
                        </div>
                        <div className="px-6">
                            <form method="POST" onSubmit={handleSubmit(handleProfileUpdate)} noValidate>
                                <input type="hidden" {...register("Id")} />
                                <div className="flex flex-row gap-x-4">
                                    <div className="my-5 flex flex-col w-1/2">
                                        <label className="label" htmlFor="userName">
                                            <FontAwesomeIcon className="mr-1" icon={faUser} />
                                            Kullanıcı Adı:
                                        </label>
                                        <input type="text" {...register("UserName", {
                                            required: "Kullanıcı adı gereklidir.",
                                            minLength: {
                                                value: 3,
                                                message: "Kullanıcı adı minimum 3 karakter olmalıdır."
                                            },
                                            maxLength: {
                                                value: 20,
                                                message: "Kullanıcı adı en fazla 20 karakter olmalıdır.",
                                            }
                                        })} id="userName" name="UserName" className="input" placeholder="Kullanıcı adınızı giriniz."></input>
                                        {errors.UserName && <span className="text-red-700 text-left mt-1">{errors.UserName?.message?.toString()}</span>}
                                    </div>

                                    <div className="my-5 flex flex-col w-1/2">
                                        <label className="label" htmlFor="firstName">
                                            <FontAwesomeIcon className="mr-1" icon={faInfo} />
                                            Ad:
                                        </label>
                                        <input type="text" {...register("FirstName", {
                                            required: "Ad gereklidir.",
                                            minLength: {
                                                value: 2,
                                                message: "Ad minimum 2 karakter olmalıdır."
                                            },
                                            maxLength: {
                                                value: 20,
                                                message: "Ad en fazla 20 karakter olmalıdır.",
                                            }
                                        })}
                                            id="firstName" name="FirstName" className="input" placeholder="Adınızı giriniz."></input>
                                        {errors.FirstName && <span className="text-red-700 text-left mt-1">{errors.FirstName?.message?.toString()}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-row gap-x-4">
                                    <div className="my-5 flex flex-col w-1/2">
                                        <label className="label" htmlFor="lastName">
                                            <FontAwesomeIcon className="mr-1" icon={faInfo} />
                                            Soyad:
                                        </label>
                                        <input type="text" {...register("LastName", {
                                            required: "Soyad gereklidir.",
                                            minLength: {
                                                value: 2,
                                                message: "Soyad minimum 2 karakter olmalıdır."
                                            },
                                            maxLength: {
                                                value: 20,
                                                message: "Soyad en fazla 20 karakter olmalıdır.",
                                            }
                                        })}
                                            id="lastName" name="LastName" className="input" placeholder="Soyadınızı giriniz."></input>
                                        {errors.LastName && <span className="text-red-700 text-left mt-1">{errors.LastName?.message?.toString()}</span>}
                                    </div>
                                    <div className="my-5 flex flex-col w-1/2">
                                        <label className="label" htmlFor="phoneNumber">
                                            <FontAwesomeIcon className="mr-1" icon={faPhone} />
                                            Telefon Numarası
                                        </label>
                                        <input type="text" {...register("PhoneNumber", {
                                            required: "Telefon numarası gereklidir.",
                                        })}
                                            id="phoneNumber" name="PhoneNumber" className="input" placeholder="Telefon numaranızı giriniz."></input>
                                        {errors.PhoneNumber && <span className="text-red-700 text-left mt-1">{errors.PhoneNumber?.message?.toString()}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-row gap-x-4">
                                    <div className="my-5 flex flex-col w-full">
                                        <label className="label" htmlFor="birthDate">
                                            <FontAwesomeIcon className="mr-1" icon={faCakeCandles} />
                                            Doğum Tarihi
                                        </label>
                                        <input type="date" {...register("BirthDate", {
                                            required: "Doğum tarihi gereklidir.",
                                        })}
                                            id="birthDate" name="BirthDate" className="input" placeholder="Doğum tarihinizi giriniz."></input>
                                        {errors.BirthDate && <span className="text-red-700 text-left mt-1">{errors.BirthDate?.message?.toString()}</span>}
                                    </div>
                                    <div className="my-5 flex flex-col w-1/2">
                                        <label className="label" htmlFor="email">
                                            <FontAwesomeIcon className="mr-1" icon={faEnvelope} />
                                            E-Posta
                                        </label>
                                        <input type="email" {...register("Email", {
                                            required: "Email gereklidir.",
                                        })}
                                            id="email" name="Email" className="input" placeholder="E-postanızı giriniz."></input>
                                        {errors.Email && <span className="text-red-700 text-left mt-1">{errors.Email?.message?.toString()}</span>}
                                    </div>
                                </div>
                                <div className="flex content-center justify-center gap-x-4 mt-6 mb-6">
                                    <button type="submit" className="smallButton text-sm lg:button font-semibold lg:hover:scale-105">
                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                        Onayla
                                    </button>
                                    <button type="button" onClick={() => {
                                        {
                                            setEditProfileOpen(false);
                                            reset();
                                            clearErrors();
                                        }
                                    }} className="smallButton text-sm lg:button font-semibold !bg-red-500 lg:hover:scale-105">
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                        Geri Dön
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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

            <ProfileReviews userReviews={userReviews} sections={sections} setSections={setSections} up={up} setRefreshComments={setRefreshComments} />

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
                                                {res.status == "Active" && <button onClick={() => handleReservationCancel(res.id!)} title="İptal Et" className="self-center bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-8 h-8 hover:scale-105 hover:bg-red-600 duration-500 text-base">
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
        </div >
    );
}