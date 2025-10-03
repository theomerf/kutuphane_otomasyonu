import { useState, useEffect, useCallback, useReducer, useMemo } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import type PaginationHeader from "../../../../types/paginationHeader";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendarAlt, faCalendarDays, faCancel, faChevronDown, faClock } from "@fortawesome/free-solid-svg-icons";
import AdminPagination from "../../../../components/ui/AdminPagination";
import type ReservationRequestParameters from "../../../../types/reservationRequestParameters";
import { toast } from "react-toastify";
import { getTodayFormatted, getTomorrowFormatted } from "../../../../utils/dateUtils";
import type TimeSlot from "../../../../types/timeSlot";
import { formatTime } from "../../../../utils/formatTime";
import type ReservationResponse from "../../../../types/reservation";
import BackendDataListReducer from "../../../../types/backendDataList";

export default function ReservationsAdmin() {
    const [reservations, dispatch] = useReducer(BackendDataListReducer<ReservationResponse>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [refreshReservations, setRefreshReservations] = useState(0);
    const [selectedDate, setSelectedDate] = useState<string | null>(getTodayFormatted());
    const [timeSlots, setTimeSlots] = useState<Map<string, TimeSlot[]>>(new Map());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const { up } = useBreakpoint();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [pagination, setPagination] = useState<PaginationHeader>({
        CurrentPage: 1,
        TotalPage: 0,
        PageSize: 6,
        TotalCount: 0,
        HasPrevious: false,
        HasPage: false
    });

    const getQueriesFromUrl = () => {
        const pageNumber = searchParams.get("pageNumber");
        const pageSize = searchParams.get("pageSize");
        const orderBy = searchParams.get("orderBy");
        const date = searchParams.get("date");
        const timeSlotId = searchParams.get("timeSlotId");

        return ({
            pageNumber: pageNumber ? parseInt(pageNumber) : 1,
            pageSize: pageSize ? parseInt(pageSize) : 6,
            orderBy: orderBy || undefined,
            date: date || undefined,
            timeSlotId: timeSlotId ? parseInt(timeSlotId) : undefined,
        });
    }
    const [query, setQuery] = useState<ReservationRequestParameters>(getQueriesFromUrl());

    async function fetchTimeSlots(signal: AbortSignal) {
        try {
            const result = await requests.timeSlots.getAllTimeSlots(signal);
            const newTimeSlots = new Map<string, TimeSlot[]>();

            const todayKey = getTodayFormatted();
            const tomorrowKey = getTomorrowFormatted();
            const now = new Date();

            result.data.forEach((timeSlot: TimeSlot) => {
                if (!newTimeSlots.has(tomorrowKey)) {
                    newTimeSlots.set(tomorrowKey, []);
                }
                newTimeSlots.get(tomorrowKey)!.push(timeSlot);

                const timeSlotEndTime = new Date(`${todayKey}T${timeSlot.endTime}`);
                if (timeSlotEndTime > now) {
                    if (!newTimeSlots.has(todayKey)) {
                        newTimeSlots.set(todayKey, []);
                    }
                    newTimeSlots.get(todayKey)!.push(timeSlot);
                }
            });

            setTimeSlots(newTimeSlots);

            const firstAvailableSlot = newTimeSlots.get(todayKey)?.[0] ||
                newTimeSlots.get(tomorrowKey)?.[0];

            if (firstAvailableSlot) {
                setSelectedTimeSlot(firstAvailableSlot);
            }

        } catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                console.error('Zaman dilimleri çekilirken hata oluştu:', error);
            }
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        fetchTimeSlots(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    const finalQuery = useMemo(() => ({
        ...query,
    }), [query]);

    const modifyUrl = useCallback(() => {
        const params = new URLSearchParams();

        if (finalQuery.pageNumber && finalQuery.pageNumber !== 1) {
            params.set("pageNumber", finalQuery.pageNumber.toString());
        }
        if (finalQuery.pageSize && finalQuery.pageSize !== 6) {
            params.set("pageSize", finalQuery.pageSize.toString());
        }
        if (finalQuery.orderBy) {
            params.set("orderBy", finalQuery.orderBy);
        }
        if (finalQuery.date) {
            params.set("date", finalQuery.date);
        }
        if (finalQuery.timeSlotId) {
            params.set("timeSlotId", finalQuery.timeSlotId.toString());
        }

        const newParamsString = params.toString();
        const currentParamsString = searchParams.toString();

        if (newParamsString !== currentParamsString) {
            setSearchParams(params, { replace: true });
        }
    }, [finalQuery, searchParams]);

    const fetchReservations = async (queryParams: ReservationRequestParameters, signal?: AbortSignal) => {
        try {
            const queryString = new URLSearchParams();

            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryString.append(key, value.toString());
                }
            });

            const response = await requests.reservation.getAllReservations(queryString, signal);

            const paginationHeaderStr = response.headers?.["x-pagination"];
            if (paginationHeaderStr) {
                const paginationData: PaginationHeader = JSON.parse(paginationHeaderStr);
                setPagination(paginationData);
            }

            return response.data as ReservationResponse[];
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

    const handleReservationCancel = async (id: number) => {
        if (window.confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")) {
            try {
                await requests.reservation.cancelReservation(id);
                toast.success("Rezervasyon başarıyla iptal edildi.");
                setRefreshReservations(prev => prev + 1);
            }
            catch (error: any) {
                toast.error("Rezervasyon iptal edilirken bir hata oluştu.");
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadReservations = async () => {
            dispatch({ type: "FETCH_START" });
            try {
                const reservations = await fetchReservations(query, controller.signal);
                const parsedReservations = reservations.map(res => ({
                    ...res,
                    displayStatus: res.status === "Active" ? "Aktif" :
                        res.status === "Cancelled" ? "İptal Edildi" :
                            res.status === "Completed" ? "Tamamlandı" :
                                res.status === "Expired" ? "Süresi Doldu" :
                                    res.status,
                    createdAt: new Date(res.createdAt!)
                }));

                dispatch({ type: "FETCH_SUCCESS", payload: parsedReservations });
            }
            catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    return;
                }
                else {
                    dispatch({ type: "FETCH_ERROR", payload: error.message || "Rezervasyonlar yüklenirken bir hata oluştu." });
                }
            }
        };

        if (timeSlots.size > 0) {
            loadReservations();
        }

        return () => {
            controller.abort();
        };
    }, [finalQuery, refreshReservations]);

    useEffect(() => {
        const date = searchParams.get("date");
        const timeSlotId = searchParams.get("timeSlotId");
        if (date && timeSlotId) {
            setSelectedDate(date);
            const slotsForDate = timeSlots.get(date);
            if (slotsForDate) {
                const slot = slotsForDate.find(t => t.id === parseInt(timeSlotId));
                if (slot) {
                    setSelectedTimeSlot(slot);
                }
            }
            setQuery(prev => ({ ...prev, date: date, timeSlotId: parseInt(timeSlotId), pageNumber: 1 }));
        }
        else if (selectedDate) {
            const slotsForDate = timeSlots.get(selectedDate);
            if (slotsForDate && slotsForDate.length > 0) {
                setSelectedTimeSlot(slotsForDate[0]);
                setQuery(prev => ({ ...prev, date: selectedDate, timeSlotId: slotsForDate[0].id, pageNumber: 1 }));
            }
            else {
                setSelectedTimeSlot(null);
                setQuery(prev => ({ ...prev, date: selectedDate, timeSlotId: undefined, pageNumber: 1 }));
            }
        }
    }, [timeSlots]);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl  text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Rezervasyon Yönetimi</p>
                <div className="flex flex-row gap-x-4 ml-auto">
                    <Link to="/admin/dashboard/reservations" className="button font-bold text-lg self-center hover:scale-105 duration-500">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="flex justify-center mt-2 mb-6">
                {(up.lg || isMobileFiltersOpen) ?
                    (
                        <div className="fixed left-0 z-10 lg:z-0 lg:static flex flex-col lg:flex-row w-fit xl:w-3/5 justify-center items-center gap-4 lg:gap-6 self-center shadow-xl lg:p-5 pb-6 rounded-br-lg lg:rounded-xl bg-white/95 backdrop-blur-sm border border-white/20">
                            <div className="bg-violet-400 lg:bg-white flex items-center py-6 px-6 lg:p-6 rounded-tr-lg lg:rounded-tr-none gap-3">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-white lg:text-violet-500 text-lg" />
                                <p className="font-bold lg:text-lg text-white lg:text-gray-600">Rezervasyon Filtreleri</p>
                                {!up.lg && isMobileFiltersOpen && <button onClick={() => setIsMobileFiltersOpen(false)} className="bg-red-600 rounded-full w-8 h-8 ml-2 text-white py-1 px-2">X</button>}
                            </div>

                            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full px-2 lg:w-auto">
                                <div className="relative flex-1 lg:min-w-[200px]">
                                    <label htmlFor="dateSelect" className="block text-sm font-medium text-gray-600 mb-2">
                                        <FontAwesomeIcon icon={faCalendarDays} className="mr-2 text-violet-500" />
                                        Tarih
                                    </label>
                                    <select id="dateSelect" className="w-full py-3 px-4 pr-10 border-2 border-gray-200 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 appearance-none text-gray-700 font-semibold hover:border-violet-300" value={selectedDate!} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTimeSlot(timeSlots.get(e.target.value)?.[0] || null); setQuery(prev => ({ ...prev, date: e.target.value, timeSlotId: timeSlots.get(e.target.value)?.[0].id })) }}>
                                        <option value={getTodayFormatted()}>Bugün</option>
                                        <option value={getTomorrowFormatted()}>Yarın</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 top-8 flex items-center text-gray-400">
                                        <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="relative flex-1 lg:min-w-[250px]">
                                    <label htmlFor="timeSlotSelect" className="block text-sm font-medium text-gray-600 mb-2">
                                        <FontAwesomeIcon icon={faClock} className="mr-2 text-violet-500" />
                                        Zaman Aralığı
                                    </label>
                                    <select id="timeSlotSelect" className="w-full py-3 px-4 pr-10 border-2 border-gray-200 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 appearance-none text-gray-700 font-semibold hover:border-violet-300" value={selectedTimeSlot?.id!} onChange={(e) => { setSelectedTimeSlot(timeSlots.get(getTomorrowFormatted())?.find(t => t.id === parseInt(e.target.value)) || null); setQuery(prev => ({ ...prev, timeSlotId: parseInt(e.target.value) })); }}>
                                        {selectedDate === getTomorrowFormatted() ? (
                                            timeSlots.get(getTomorrowFormatted())?.map(timeSlot => (
                                                <option key={timeSlot.id} value={timeSlot.id}>
                                                    {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                                                </option>
                                            )) || []
                                        ) : (
                                            timeSlots.get(getTodayFormatted())?.map(timeSlot => (
                                                <option key={timeSlot.id} value={timeSlot.id}>
                                                    {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                                                </option>
                                            )) || []
                                        )}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 top-8 flex items-center text-gray-400">
                                        <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    : (
                        (
                            <button className="absolute left-0 p-1 bg-violet-500 text-xl font-semibold text-white rounded-tr-lg rounded-br-lg" onClick={() => setIsMobileFiltersOpen(true)}>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                            </button>
                        )
                    )
                }
            </div>
            <div className="sm:px-1 px-5 lg:px-20">


                <div className="lg:col-span-3 flex flex-col mt-8 lg:mt-0">
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
                        <div>
                            <table className="table-auto w-full border-collapse border border-gray-200 bg-white shadow-lg">
                                <thead>
                                    <tr className="bg-violet-400">
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tl-lg px-4 py-6 text-center">Kullanıcı adı</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Oluşturulma Tarihi</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Koltuk Id</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Durum</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tr-lg px-4 py-6 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.data.map((res) => (
                                        <tr key={res.id} className="hover:bg-gray-50">
                                            <td className="text-gray-500 font-semibold text-lg border-t border-violet-200 px-4 py-6">{res.accountUserName}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{res.createdAt?.toLocaleString("tr-TR", {
                                                dateStyle: "full", timeStyle: "short"
                                            })}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{res.seatId}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6 text-center"><p className={`rounded-full text-white shadow-md hover:scale-105 duration-500 py-1 ${res.displayStatus == "Aktif" ? "bg-green-400" : res.displayStatus == "İptal Edildi" ? "bg-red-400" : res.displayStatus == "Tamamlandı" ? "bg-violet-400" : "bg-gray-400"}`}>{res.displayStatus}</p></td>
                                            <td className="border-l border-t border-b border-violet-200 px-4 py-6">
                                                {res.status !== "Cancelled" && <div className="flex flex-row justify-center gap-x-2">
                                                    <button onClick={() => handleReservationCancel(res.id!)} title="Rezervasyonu İptal Et" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faCancel} className="self-center" />
                                                    </button>
                                                </div>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <AdminPagination data={reservations.data} pagination={pagination} isLoading={reservations.isLoading} error={reservations.error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}