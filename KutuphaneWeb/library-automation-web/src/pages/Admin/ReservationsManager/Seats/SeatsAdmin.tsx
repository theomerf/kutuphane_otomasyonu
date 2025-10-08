import { useEffect, useReducer, useState } from "react";
import type Seat from "../../../../types/seat";
import requests from "../../../../services/api";
import LibrarySeatMapAdmin from "../../../../components/reservation/LibrarySeatMapAdmin";
import { groupSeatsByTable } from "../../../../utils/groupSeatsByTable";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import BackendDataListReducer from "../../../../types/backendDataList";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";

export type SeatInfo = {
    seatId: number;
    seatNumber: number;
    tableName: string;
}

export default function SeatsAdmin() {
    const [seats, dispatch] = useReducer(BackendDataListReducer<Seat>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [refreshSeats, setRefreshSeats] = useState(0);
    const [hoveredSeat, setHoveredSeat] = useState<SeatInfo | null>(null);
    const tables = groupSeatsByTable(seats.data ?? []);
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { handleSubmit, register, clearErrors, reset, formState: { errors } } = useForm();

    async function fetchSeats(signal: AbortSignal) {
        dispatch({ type: "FETCH_START" });
        try {
            const response = await requests.seats.getAllSeats(signal);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data as Seat[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Koltuklar çekilirken bir hata oluştu" });
            }
        }
    };

    const handleSeatDelete = async (seatId: number) => {
        if (!window.confirm("Bu koltuğu silmek istediğinize emin misiniz?")) return;
        try {
            await requests.seats.deleteSeat(seatId);
            toast.success("Koltuk başarıyla silindi.");
            setRefreshSeats(prev => prev + 1);
        }
        catch (error) {
            console.error(error);
            toast.error("Koltuk silinirken hata oluştu.");
        }
    };

    const handleSeatCreate = async (formData: any) => {
        try {
            await requests.seats.createSeat(formData);
            toast.success("Koltuk başarıyla oluşturuldu.");
            reset();
            clearErrors();
            setShowCreateModal(false);
            setRefreshSeats(prev => prev + 1);
        }
        catch (error) {
            console.error(error);
            toast.error("Koltuk oluşturulurken hata oluştu");
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchSeats(controller.signal);

        return () => {
            controller.abort();
        };
    }, [refreshSeats]);

    const handleHoverSeat = async (seatId: number, seatNumber: number, tableName: string) => {
        setHoveredSeat({
            seatId,
            seatNumber,
            tableName
        });
    }

    const handleNoHoverSeat = () => {
        setHoveredSeat(null);
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-col md:flex-row mx-4 md:mx-8 lg:mx-20 gap-4">
                <p className="font-semibold text-2xl md:text-4xl text-violet-500 h-fit border-none pb-2 mb-4 md:mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">
                    {isMobile ? 'Koltuklar' : 'Koltuk Yönetimi'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 md:ml-auto ">
                    <button type="button" onClick={() => { reset(); clearErrors(); setShowCreateModal(true) }} className="lg:self-center button !bg-green-400 hover:scale-105 text-sm md:text-lg font-bold duration-500 text-center py-2">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        {isMobile ? 'Ekle' : 'Yeni Koltuk Ekle'}
                    </button>
                    <Link to="/admin/dashboard/reservations" className="lg:self-center button font-bold text-sm md:text-lg hover:scale-105 duration-500 text-center py-2">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="mt-5 lg:mt-0 px-4 md:px-5 lg:px-20">
                <div className="rounded-lg bg-white border shadow-violet-200 border-violet-400 shadow-xl">
                    <LibrarySeatMapAdmin tables={tables} hoveredSeat={hoveredSeat} onHoverSeat={handleHoverSeat} noHoverSeat={handleNoHoverSeat} handleSeatDelete={handleSeatDelete} />
                </div>
                {showCreateModal && (
                    <div className="fixed px-5 lg:px-0 inset-0 mt-20 overflow-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="flex flex-col bg-white rounded-3xl shadow-lg w-full max-w-md">
                            <div className="bg-violet-400 py-3 lg:py-4 flex flex-col text-center gap-y-1 px-6 lg:px-10 rounded-tr-3xl rounded-tl-3xl">
                                <p className="font-bold text-base lg:text-xl text-white">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    YENİ KOLTUK OLUŞTUR
                                </p>
                            </div>
                            <div>
                                <form method="POST" onSubmit={handleSubmit(handleSeatCreate)} noValidate>
                                    <div className="flex flex-col px-6 lg:px-10 py-4 gap-y-4">
                                        <div className="flex flex-col gap-y-2 self-center w-full">
                                            <label htmlFor="seatNumber" className="font-bold text-gray-500 text-sm lg:text-base">Koltuk numarası</label>
                                            <input type="number" {...register("seatNumber", {
                                                required: "Koltuk numarası gereklidir.",
                                                min: { value: 1, message: "Koltuk numarası en az 1 olabilir." },
                                            })} id="seatNumber" placeholder="1" name="seatNumber" className="input text-sm lg:text-base" />
                                            {errors.seatNumber && <span className="text-red-700 text-xs lg:text-sm text-left mt-1">{errors.seatNumber?.message?.toString()}</span>}
                                        </div>
                                        <div className="flex flex-col gap-y-2 self-center w-full">
                                            <label htmlFor="location" className="font-bold text-gray-500 text-sm lg:text-base">Masa</label>
                                            <input type="text" {...register("location", {
                                                required: "Masa bilgisi gereklidir.",
                                            })} id="location" placeholder="M-1, M-2 tipinde" name="location" className="input text-sm lg:text-base" />
                                            {errors.location && <span className="text-red-700 text-xs lg:text-sm text-left mt-1">{errors.location?.message?.toString()}</span>}
                                        </div>
                                        <div className="flex flex-col gap-y-2 self-center w-full">
                                            <label htmlFor="floor" className="font-bold text-gray-500 text-sm lg:text-base">Kat</label>
                                            <input type="number" {...register("floor", {
                                                required: "Kat bilgisi gereklidir.",
                                                min: { value: 1, message: "Kat en az 1 olabilir." },
                                            })} id="floor" placeholder="1" name="floor" className="input text-sm lg:text-base" />
                                            {errors.floor && <span className="text-red-700 text-xs lg:text-sm text-left mt-1">{errors.floor?.message?.toString()}</span>}
                                        </div>
                                        <div className="flex content-center justify-center gap-x-3 lg:gap-x-4 mt-4 lg:mt-6 mb-4 lg:mb-6">
                                            <button type="submit" className="button w-1/2 text-sm lg:text-base font-semibold hover:scale-105 py-2 lg:py-3">
                                                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                Onayla
                                            </button>
                                            <button onClick={() => { setShowCreateModal(false); reset(); clearErrors(); }} className="button w-1/2 text-sm lg:text-base font-semibold !bg-red-500 hover:scale-105 py-2 lg:py-3">
                                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                                Geri
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}