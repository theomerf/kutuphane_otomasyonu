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

export type SeatInfo = {
    seatId: number;
    seatNumber: number;
    tableName: string;
}

export default function SeatsAdmin() {
    const [seats, dispatch] = useReducer(BackendDataListReducer<Seat>, {
        data: [],
        isLoading: false,
        error: null
    });
    const [hoveredSeat, setHoveredSeat] = useState<SeatInfo | null>(null);
    const tables = groupSeatsByTable(seats.data ?? []);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { handleSubmit, register, clearErrors, reset, formState: { errors } } = useForm();

    async function fetchSeats() {
        dispatch({ type: "FETCH_START" });
        try {
            const controller = new AbortController();

            const response = await requests.seats.getAllSeats(controller.signal);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data as Seat[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                console.log("Request cancelled");
            }
            dispatch({ type: "FETCH_ERROR", payload: error.message || "Koltuklar çekilirken bir hata oluştu" });
        }
    };

    useEffect(() => {
        fetchSeats();
    }, []);

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

    const handleSeatDelete = async (seatId: number) => {
        if (!window.confirm("Bu koltuğu silmek istediğinize emin misiniz?")) return;
        try {
            await requests.seats.deleteSeat(seatId);
            toast.success("Koltuk başarıyla silindi.");
            fetchSeats();
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
            fetchSeats();
        }
        catch (error) {
            console.error(error);
            toast.error("Koltuk oluşturulurken hata oluştu");
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-row mx-8 lg:mx-20">
                <p className="font-semibold text-4xl  text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Koltuk Yönetimi</p>
                <div className="flex flex-row gap-x-4 ml-auto ">
                    <button type="button" onClick={() => {reset(); clearErrors(); setShowCreateModal(true)}} className="button !bg-green-400 hover:scale-105 text-lg font-bold duration-500 self-center">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Yeni Koltuk Ekle
                    </button>
                    <Link to="/admin/dashboard/reservations" className="button font-bold text-lg self-center hover:scale-105 duration-500">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Link>
                </div>
            </div>
            <div className="px-5 lg:px-20">
                <div className="rounded-lg bg-white border shadow-violet-200 border-violet-400 shadow-xl">
                    <LibrarySeatMapAdmin tables={tables} hoveredSeat={hoveredSeat} onHoverSeat={handleHoverSeat} noHoverSeat={handleNoHoverSeat} handleSeatDelete={handleSeatDelete} />
                </div>
                {showCreateModal && (
                    <div className="fixed px-5 lg:px-0 inset-0 lg:inset-0 mt-20 overflow-auto lg:mt-20 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="flex flex-col bg-white rounded-3xl shadow-lg">
                            <div className="bg-violet-400 py-2 lg:py-4 flex flex-col text-center gap-y-1 px-10 lg:px-14 rounded-tr-3xl rounded-tl-3xl">
                                <p className="font-bold text-lg lg:text-xl text-white">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    YENİ KOLTUK OLUŞTUR
                                </p>
                            </div>
                            <div>
                                <form method="POST" onSubmit={handleSubmit(handleSeatCreate)} noValidate>
                                    <div className="flex flex-col px-10 py-4 gap-y-4">
                                        <div className="flex flex-col gap-y-4 self-center">
                                            <label htmlFor="seatNumber" className="font-bold text-gray-500 text-base">Koltuk numarası</label>
                                            <div className="flex">
                                                <input type="number" {...register("seatNumber", {
                                                    required: "Koltuk numarası gereklidir.",
                                                    min: { value: 1, message: "Koltuk numarası en az 1 olabilir." },
                                                })} id="seatNumber" placeholder="1" name="seatNumber" className="input" />
                                            </div>
                                            {errors.seatNumber && <span className="text-red-700 text-left mt-1">{errors.seatNumber?.message?.toString()}</span>}
                                        </div>
                                        <div className="flex flex-col gap-y-4 self-center">
                                            <label htmlFor="location" className="font-bold text-gray-500 text-base">Masa</label>
                                            <div className="flex">
                                                <input type="text" {...register("location", {
                                                    required: "Masa bilgisi gereklidir.",
                                                })} id="location" placeholder="M-1, M-2 tipinde" name="location" className="input" />
                                            </div>
                                            {errors.location && <span className="text-red-700 text-left mt-1">{errors.location?.message?.toString()}</span>}
                                        </div>
                                        <div className="flex flex-col gap-y-4 self-center">
                                            <label htmlFor="floor" className="font-bold text-gray-500 text-base">Kat</label>
                                            <div className="flex">
                                                <input type="number" {...register("floor", {
                                                    required: "Kat bilgisi gereklidir.",
                                                    min: { value: 1, message: "Koltuk numarası en az 1 olabilir." },
                                                })} id="floor" placeholder="1" name="floor" className="input" />
                                            </div>
                                            {errors.floor && <span className="text-red-700 text-left mt-1">{errors.floor?.message?.toString()}</span>}
                                        </div>
                                        <div className="flex content-center justify-center gap-x-4 mt-6 mb-6">
                                            <button type="submit" className="smallButton text-sm lg:button font-semibold lg:hover:scale-105">
                                                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                Onayla
                                            </button>
                                            <button onClick={() => {{
                                                setShowCreateModal(false);
                                                reset();
                                                clearErrors();  
                                            }
                                            }} className="smallButton text-sm lg:button font-semibold !bg-red-500 lg:hover:scale-105">
                                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                                Geri Dön
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