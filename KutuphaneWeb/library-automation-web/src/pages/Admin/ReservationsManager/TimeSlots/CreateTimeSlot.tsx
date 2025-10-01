import { useState } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export function CreateTimeSlot() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleTimeSlotCreation = async (formData: any) => {
        try {
            setIsLoading(true);
            await requests.timeSlots.createTimeSlot(formData);

            toast.success('Zaman aralığı başarıyla oluşturuldu!');
            navigate('/admin/timeslots');

        } catch (error: any) {
            console.error('Zaman aralığı oluşturma hatası:', error);
            toast.error('Zaman aralığı oluşturulurken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <ClipLoader size={40} color="#8B5CF6" />
            </div>
        );
    }

    return (
        <div className="flex flex-col px-8 w-2/5 mx-auto">
            <form method="POST" onSubmit={handleSubmit(handleTimeSlotCreation)} noValidate>
                <div className="py-10 text-center bg-violet-500 rounded-tl-lg rounded-tr-lg">
                    <p className="text-white font-bold text-3xl">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Yeni Zaman aralığı Ekle
                    </p>
                </div>
                <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 py-10">

                    <div className="flex flex-row gap-x-10 justify-center">
                        <div className="flex flex-col w-3/5">
                            <label htmlFor="startTime" className="font-bold text-gray-500 text-base">Başlangıç Saati</label>
                            <input type="time" {...register("startTime", {
                                required: "Başlangıç saati bilgisi gereklidir.",
                            })} id="startTime" name="startTime" className="input w-full mt-4" />
                            {errors.startTime && <span className="text-red-700 text-left mt-1">{errors.startTime?.message?.toString()}</span>}
                        </div>
                    </div>
                    <div className="flex flex-row gap-x-10 justify-center">
                        <div className="flex flex-col w-3/5">
                            <label htmlFor="endTime" className="font-bold text-gray-500 text-base">Bitiş Saati</label>
                            <input type="time" {...register("endTime", {
                                required: "Bitiş saati bilgisi gereklidir.",
                            })} id="endTime" name="endTime" className="input w-full mt-4" />
                            {errors.endTime && <span className="text-red-700 text-left mt-1">{errors.endTime?.message?.toString()}</span>}
                        </div>
                    </div>
                    <div className="flex flex-row mt-10 gap-x-4 px-20">
                        <button
                            type="submit"
                            className="button w-1/2 font-bold text-lg !py-4 hover:scale-105 duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ClipLoader size={20} color="#fff" />
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    Onayla
                                </>
                            )}
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="button w-1/2 !bg-red-500 font-bold !py-4 text-center text-lg hover:scale-105 duration-300">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Geri Dön
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}