import { useEffect, useReducer } from "react";
import requests from "../../../../services/api";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import type TimeSlot from "../../../../types/timeSlot";
import { ClipLoader } from "react-spinners";
import BackendDataListReducer from "../../../../types/backendDataList";


export default function TimeSlotsAdmin() {
    const [timeSlots, dispatch] = useReducer(BackendDataListReducer<TimeSlot>, {
        data: [],
        isLoading: false,
        error: null
    });

    async function fetchTimeSlots() {
        dispatch({ type: "FETCH_START" });
        try {
            const controller = new AbortController();

            const response = await requests.timeSlots.getAllTimeSlots(controller.signal);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data as TimeSlot[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                console.log("Request cancelled");
            }
            dispatch({ type: "FETCH_ERROR", payload: error.message || "Zaman aralıkları çekilirken bir hata oluştu" });
        }
    };

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    const handleTimeSlotDelete = async (seatId: number) => {
        if (!window.confirm("Bu zaman aralığını silmek istediğinize emin misiniz?")) return;
        try {
            await requests.timeSlots.deleteTimeSlot(seatId);
            toast.success("Zaman aralığı başarıyla silindi.");
            fetchTimeSlots();
        }
        catch (error) {
            console.error(error);
            toast.error("Zaman aralığı silinirken hata oluştu.");
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl  text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Zaman Aralığı Yönetimi</p>
                <div className="flex flex-row gap-x-4 ml-auto ">
                    <Link to="/admin/timeslots/create" className="button !bg-green-400 hover:scale-105 text-lg font-bold duration-500 self-center">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Yeni Zaman Aralığı Ekle
                    </Link>
                    <Link to="/admin/dashboard/reservations" className="button font-bold text-lg self-center hover:scale-105 duration-500">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="px-5 lg:px-20">
                <div className="lg:col-span-3 flex flex-col mt-8 lg:mt-0">
                    {(timeSlots.isLoading) && (
                        <div className="flex justify-center items-center h-64">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                    )}

                    {timeSlots.error && (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            {timeSlots.error}
                        </div>
                    )}

                    {timeSlots.data && !timeSlots.isLoading && (
                        <div>
                            <table className="table-auto w-full border-collapse border border-gray-200 bg-white shadow-lg">
                                <thead>
                                    <tr className="bg-violet-400">
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tl-lg px-4 py-6 text-center">Id</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 px-4 py-6 text-center">Zaman Aralığı</th>
                                        <th className="text-white font-bold text-lg border border-gray-200 rounded-tr-lg px-4 py-6 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.data.map((ts) => (
                                        <tr key={ts.id} className="hover:bg-gray-50">
                                            <td className="text-gray-500 font-semibold text-lg border-t border-violet-200 px-4 py-6">{ts.id}</td>
                                            <td className="text-gray-500 font-semibold text-lg border border-violet-200 px-4 py-6">{ts.startTime} - {ts.endTime}</td>
                                            <td className="border-l border-t border-b border-violet-200 px-4 py-6">
                                                <div className="flex flex-row justify-center gap-x-2">
                                                    <Link to={`/admin/timeslots/update/${ts.id}`} title="Düzenle" className="bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-yellow-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faEdit} className="self-center" />
                                                    </Link>
                                                    <button onClick={() => handleTimeSlotDelete(ts.id!)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-10 h-10 hover:scale-105 hover:bg-red-600 duration-500 text-lg">
                                                        <FontAwesomeIcon icon={faTrash} className="self-center" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}