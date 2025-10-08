import { useEffect, useReducer, useState } from "react";
import requests from "../../../../services/api";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import type TimeSlot from "../../../../types/timeSlot";
import { ClipLoader } from "react-spinners";
import BackendDataListReducer from "../../../../types/backendDataList";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";


export default function TimeSlotsAdmin() {
    const [timeSlots, dispatch] = useReducer(BackendDataListReducer<TimeSlot>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [refreshTimeSlots, setRefreshTimeSlots] = useState(0);
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    async function fetchTimeSlots(signal: AbortSignal) {
        dispatch({ type: "FETCH_START" });
        try {

            const response = await requests.timeSlots.getAllTimeSlots(signal);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data as TimeSlot[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Zaman aralıkları çekilirken bir hata oluştu" });
            }
        }
    };

    const handleTimeSlotDelete = async (seatId: number) => {
        if (!window.confirm("Bu zaman aralığını silmek istediğinize emin misiniz?")) return;
        try {
            await requests.timeSlots.deleteTimeSlot(seatId);
            toast.success("Zaman aralığı başarıyla silindi.");
            setRefreshTimeSlots(prev => prev + 1);
        }
        catch (error) {
            console.error(error);
            toast.error("Zaman aralığı silinirken hata oluştu.");
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchTimeSlots(controller.signal);

        return () => {
            controller.abort();
        };
    }, [refreshTimeSlots]);

    return (
        <div className="flex flex-col">
            <div className="flex flex-col md:flex-row mx-4 md:mx-8 lg:mx-20 gap-4">
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-4 md:mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">
                    {isMobile ? 'Zaman Aralıkları' : 'Zaman Aralığı Yönetimi'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 md:ml-auto ">
                    <Link to="/admin/timeslots/create" className="lg:self-center button !bg-green-400 hover:scale-105 text-sm md:text-lg font-bold duration-500 text-center py-2">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        {isMobile ? 'Ekle' : 'Yeni Zaman Aralığı Ekle'}
                    </Link>
                    <Link to="/admin/dashboard/reservations" className="lg:self-center button font-bold text-sm md:text-lg hover:scale-105 duration-500 text-center py-2">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="px-4 md:px-5 lg:px-20">
                <div className="lg:col-span-3 flex flex-col mt-4 md:mt-8 lg:mt-0">
                    {(timeSlots.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {timeSlots.error && (
                        <div className="flex justify-center items-center h-64 text-red-500 text-center px-4">
                            {timeSlots.error}
                        </div>
                    )}

                    {timeSlots.data && !timeSlots.isLoading && (
                        <>
                            {isMobile ? (
                                <div className="space-y-4">
                                    {timeSlots.data.map((ts) => (
                                        <div key={ts.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 mb-1">ID: {ts.id}</p>
                                                    <h3 className="font-semibold text-base text-gray-800">
                                                        {ts.startTime} - {ts.endTime}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/admin/timeslots/update/${ts.id}`}
                                                    className="flex-1 py-2 px-3 bg-yellow-500 text-white rounded text-sm font-medium hover:bg-yellow-600 transition text-center"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                    Düzenle
                                                </Link>
                                                <button
                                                    onClick={() => handleTimeSlotDelete(ts.id!)}
                                                    className="flex-1 py-2 px-3 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                    Sil
                                                </button>
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
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Id
                                                    </th>
                                                    <th className="px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        Zaman Aralığı
                                                    </th>
                                                    <th className="px-4 py-5 text-center text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                                                        İşlemler
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {timeSlots.data.map((ts) => (
                                                    <tr key={ts.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4 text-sm md:text-base text-gray-500">
                                                            {ts.id}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm md:text-base font-medium text-gray-900">
                                                            {ts.startTime} - {ts.endTime}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-medium">
                                                            <div className="flex justify-center gap-2">
                                                                <Link
                                                                    to={`/admin/timeslots/update/${ts.id}`}
                                                                    title="Düzenle"
                                                                    className="group relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/50 hover:scale-110 active:scale-95"
                                                                >
                                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                    <FontAwesomeIcon
                                                                        icon={faEdit}
                                                                        className="relative z-10 text-sm md:text-base text-white drop-shadow-sm group-hover:rotate-12 transition-transform duration-300"
                                                                    />
                                                                    <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-300 to-amber-500 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                                                                </Link>

                                                                <button
                                                                    onClick={() => handleTimeSlotDelete(ts.id!)}
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
                </div>
            </div>
        </div>
    );
}