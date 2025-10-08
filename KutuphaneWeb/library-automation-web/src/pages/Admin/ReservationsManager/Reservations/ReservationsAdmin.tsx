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
    const isMobile = !up.md;
    const isTablet = up.md && !up.lg;
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
            <div className="flex flex-col md:flex-row mx-4 md:mx-8 lg:mx-20 gap-4">
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-4 md:mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">
                    {isMobile ? 'Rezervasyonlar' : 'Rezervasyon Yönetimi'}
                </p>
                <div className="flex ml-auto">
                    <Link to="/admin/dashboard/reservations" className="lg:self-center button font-bold text-sm md:text-lg hover:scale-105 duration-500 py-2">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="flex justify-center mt-2 mb-6">
                {(up.lg || isMobileFiltersOpen) ? (
                    <div className="fixed left-0 z-10 lg:z-0 lg:static flex flex-col lg:flex-row w-full lg:w-fit xl:w-3/5 justify-center items-center gap-4 lg:gap-6 self-center shadow-xl lg:p-5 pb-6 rounded-br-lg lg:rounded-xl bg-white/95 backdrop-blur-sm border border-white/20">
                        <div className="bg-violet-400 w-full lg:bg-white flex items-center py-4 px-4 lg:p-6 rounded-tr-lg lg:rounded-tr-none gap-3">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-white lg:text-violet-500 text-base lg:text-lg" />
                            <p className="font-bold text-sm lg:text-lg text-white lg:text-gray-600">Rezervasyon Filtreleri</p>
                            {!up.lg && isMobileFiltersOpen && (
                                <button onClick={() => setIsMobileFiltersOpen(false)} className="bg-red-600 rounded-full w-7 h-7 ml-auto text-white text-sm">
                                    X
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full px-4 lg:w-auto">
                            <div className="relative flex-1 lg:min-w-[200px]">
                                <label htmlFor="dateSelect" className="block text-xs md:text-sm font-medium text-gray-600 mb-2">
                                    <FontAwesomeIcon icon={faCalendarDays} className="mr-2 text-violet-500" />
                                    Tarih
                                </label>
                                <select
                                    id="dateSelect"
                                    className="w-full py-2 md:py-3 px-3 md:px-4 pr-10 border-2 border-gray-200 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 appearance-none text-gray-700 text-sm md:text-base font-semibold hover:border-violet-300"
                                    value={selectedDate!}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedTimeSlot(timeSlots.get(e.target.value)?.[0] || null);
                                        setQuery(prev => ({ ...prev, date: e.target.value, timeSlotId: timeSlots.get(e.target.value)?.[0].id }))
                                    }}
                                >
                                    <option value={getTodayFormatted()}>Bugün</option>
                                    <option value={getTomorrowFormatted()}>Yarın</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 top-6 md:top-8 flex items-center text-gray-400">
                                    <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 md:h-4 md:w-4" />
                                </div>
                            </div>

                            <div className="relative flex-1 lg:min-w-[250px]">
                                <label htmlFor="timeSlotSelect" className="block text-xs md:text-sm font-medium text-gray-600 mb-2">
                                    <FontAwesomeIcon icon={faClock} className="mr-2 text-violet-500" />
                                    Zaman Aralığı
                                </label>
                                <select
                                    id="timeSlotSelect"
                                    className="w-full py-2 md:py-3 px-3 md:px-4 pr-10 border-2 border-gray-200 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 appearance-none text-gray-700 text-sm md:text-base font-semibold hover:border-violet-300"
                                    value={selectedTimeSlot?.id!}
                                    onChange={(e) => {
                                        setSelectedTimeSlot(timeSlots.get(getTomorrowFormatted())?.find(t => t.id === parseInt(e.target.value)) || null);
                                        setQuery(prev => ({ ...prev, timeSlotId: parseInt(e.target.value) }));
                                    }}
                                >
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
                                <div className="pointer-events-none absolute inset-y-0 right-3 top-6 md:top-8 flex items-center text-gray-400">
                                    <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 md:h-4 md:w-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button className="absolute left-0 p-2 bg-violet-500 text-base md:text-xl font-semibold text-white rounded-tr-lg rounded-br-lg" onClick={() => setIsMobileFiltersOpen(true)}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                    </button>
                )}
            </div>
            <div className="px-4 md:px-5 lg:px-20">
                <div className="lg:col-span-3 flex flex-col mt-4 md:mt-8 lg:mt-0">
                    {(reservations.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {reservations.error && (
                        <div className="flex justify-center items-center h-64 text-red-500 text-center px-4">
                            {reservations.error}
                        </div>
                    )}

                    {reservations.data && !reservations.isLoading && (
                        <>
                            {isMobile ? (
                                <>
                                    {reservations.data.length != 0 ? (
                                        <div className="space-y-4">
                                            {reservations.data.map((res) => (
                                                <div key={res.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-base text-gray-800 mb-1">
                                                                {res.accountUserName}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 mb-2">
                                                                {res.createdAt?.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                Koltuk: {res.seatId}
                                                            </p>
                                                            <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${res.displayStatus === "Aktif" ? "bg-green-400" : res.displayStatus === "İptal Edildi" ? "bg-red-400" : res.displayStatus === "Tamamlandı" ? "bg-violet-400" : "bg-gray-400"}`}>
                                                                {res.displayStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {res.status !== "Cancelled" && (
                                                        <button
                                                            onClick={() => handleReservationCancel(res.id!)}
                                                            className="w-full py-2 px-3 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition"
                                                        >
                                                            <FontAwesomeIcon icon={faCancel} className="mr-2" />
                                                            İptal Et
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center font-bold text-gray-400">Aktif Rezervasyon Yok.</p>
                                    )}
                                </>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-violet-400">
                                                <tr>
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Kullanıcı
                                                    </th>
                                                    {!isTablet && (
                                                        <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                            Oluşturulma
                                                        </th>
                                                    )}
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Koltuk
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
                                                {reservations.data.map((res) => (
                                                    <tr key={res.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm md:text-base font-medium text-gray-900">
                                                                {res.accountUserName}
                                                            </div>
                                                            {isTablet && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {res.createdAt?.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                                                                </div>
                                                            )}
                                                        </td>
                                                        {!isTablet && (
                                                            <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                                {res.createdAt?.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                            #{res.seatId}
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`inline-flex px-4 py-2 text-xs md:text-sm font-semibold rounded-full ${res.displayStatus === "Aktif" ? "bg-green-100 text-green-800" :
                                                                res.displayStatus === "İptal Edildi" ? "bg-red-100 text-red-800" :
                                                                    res.displayStatus === "Tamamlandı" ? "bg-violet-100 text-violet-800" :
                                                                        "bg-gray-100 text-gray-800"
                                                                }`}>
                                                                {res.displayStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {res.status !== "Cancelled" && (
                                                                <div className="flex justify-center">
                                                                    <button
                                                                        onClick={() => handleReservationCancel(res.id!)}
                                                                        title="İptal Et"
                                                                        className="group relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-red-600/50 hover:scale-110 active:scale-95"
                                                                    >
                                                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                        <FontAwesomeIcon
                                                                            icon={faCancel}
                                                                            className="relative z-10 text-sm md:text-base text-white drop-shadow-sm group-hover:rotate-180 transition-transform duration-300"
                                                                        />
                                                                        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-400 to-red-600 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                                                                    </button>
                                                                </div>
                                                            )}
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

                    <AdminPagination data={reservations.data} pagination={pagination} isLoading={reservations.isLoading} error={reservations.error} up={up} query={query} setQuery={setQuery} />
                </div>
            </div>
        </div>
    );
}