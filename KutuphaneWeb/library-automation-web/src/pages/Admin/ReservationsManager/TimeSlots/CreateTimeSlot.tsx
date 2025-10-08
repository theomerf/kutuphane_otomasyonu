import { useState } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";

export function CreateTimeSlot() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { up } = useBreakpoint();
    const isMobile = !up.md;    
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
        <div className={`flex flex-col ${isMobile ? 'px-4 w-full' : 'px-8 w-full md:w-3/5 lg:w-2/5'} mx-auto`}>
            <form method="POST" onSubmit={handleSubmit(handleTimeSlotCreation)} noValidate>
                <div className={`${isMobile ? 'py-6' : 'py-10'} text-center bg-violet-500 rounded-tl-lg rounded-tr-lg`}>
                    <p className={`text-white font-bold ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        {isMobile ? 'Yeni Zaman Aralığı' : 'Yeni Zaman Aralığı Ekle'}
                    </p>
                </div>
                <div className={`flex flex-col ${isMobile ? 'gap-y-4 px-4 py-6' : 'gap-y-6 px-6 py-10'} rounded-lg shadow-xl bg-white border border-gray-200`}>
                    <div className="flex flex-row justify-center">
                        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-4/5 md:w-3/5'}`}>
                            <label htmlFor="startTime" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>Başlangıç Saati</label>
                            <input type="time" {...register("startTime", {
                                required: "Başlangıç saati bilgisi gereklidir.",
                            })} id="startTime" name="startTime" className={`input w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
                            {errors.startTime && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.startTime?.message?.toString()}</span>}
                        </div>
                    </div>
                    <div className="flex flex-row justify-center">
                        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-4/5 md:w-3/5'}`}>
                            <label htmlFor="endTime" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>Bitiş Saati</label>
                            <input type="time" {...register("endTime", {
                                required: "Bitiş saati bilgisi gereklidir.",
                            })} id="endTime" name="endTime" className={`input w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
                            {errors.endTime && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.endTime?.message?.toString()}</span>}
                        </div>
                    </div>
                    <div className={`flex ${isMobile ? 'flex-col gap-y-3 mt-6' : 'flex-row mt-10 gap-x-4'} ${isMobile ? 'px-0' : 'px-20'}`}>
                        <button
                            type="submit"
                            className={`button ${isMobile ? 'w-full' : 'w-1/2'} font-bold ${isMobile ? 'text-base py-3' : 'text-lg py-4'} hover:scale-105 duration-300`}
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
                        <button type="button" onClick={() => navigate(-1)} className={`button ${isMobile ? 'w-full' : 'w-1/2'} !bg-red-500 font-bold ${isMobile ? 'text-base py-3' : 'text-lg py-4'} text-center hover:scale-105 duration-300`}>
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Geri Dön
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}