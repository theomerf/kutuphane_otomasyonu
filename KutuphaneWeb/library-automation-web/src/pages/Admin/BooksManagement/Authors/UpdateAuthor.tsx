import { useEffect, useReducer } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type Author from "../../../../types/author";
import BackendDataObjectReducer from "../../../../types/backendDataObject";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";

export function UpdateAuthor() {
    const navigate = useNavigate();
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    const [authorDetail, dispatch] = useReducer(BackendDataObjectReducer<Author>, {
        data: null,
        isLoading: false,
        error: null
    });
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            id: 0,
            name: "",
        }
    });

    useEffect(() => {
        if (authorDetail.data) {
            reset({
                id: authorDetail.data.id || 0,
                name: authorDetail.data.name || "",
            });
        }
    }, [authorDetail.data, reset]);

    const fetchAuthors = async (id: string, signal?: AbortSignal) => {
        dispatch({ type: "FETCH_START" });
        try {
            const response = await requests.authors.getOneAuthor(parseInt(id), signal);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data as Author });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Yazar bilgileri getirilirken bir hata oluştu." });
            }
        }
    };

    const handleAuthorUpdate = async (formData: any) => {
        try {
            await requests.authors.updateAuthor(formData);

            toast.success('Yazar başarıyla güncellendi!');
            navigate('/admin/authors');

        } catch (error: any) {
            console.error('Güncelleme hatası:', error);
            toast.error('Güncelleme sırasında hata oluştu.');
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        const id: string = window.location.pathname.split('/').pop() || '';
        fetchAuthors(id, controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <div className="flex justify-center">
            {(authorDetail.isLoading) && (
                <div className="flex justify-center items-center h-64">
                    <ClipLoader size={40} color="#8B5CF6" />
                </div>
            )}

            {authorDetail.error && (
                <div className="flex justify-center items-center h-64 text-red-500 text-center px-4">
                    {authorDetail.error}
                </div>
            )}
            {authorDetail.data && !authorDetail.isLoading &&
                <div className={`flex flex-col ${isMobile ? 'px-4 w-full' : 'px-8 w-full md:w-3/5 lg:w-2/5'}`}>
                    <form method="POST" onSubmit={handleSubmit(handleAuthorUpdate)} noValidate>
                        <div className={`${isMobile ? 'py-6' : 'py-10'} text-center bg-violet-500 rounded-tl-lg rounded-tr-lg`}>
                            <p className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-2xl md:text-3xl'}`}>
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                {isMobile ? `#${authorDetail.data.id} Düzenle` : `Yazar Id: ${authorDetail.data.id} - Düzenle`}
                            </p>
                        </div>
                        <div className={`flex flex-col ${isMobile ? 'gap-y-4 py-6 px-4' : 'gap-y-6 px-8 py-10'} rounded-lg shadow-xl bg-white border border-gray-200`}>
                            <div className="flex flex-row justify-center">
                                <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-4/5 md:w-3/5'}`}>
                                    <label htmlFor="name" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>
                                        Yazar Adı
                                    </label>
                                    <input 
                                        type="text" 
                                        {...register("name", {
                                            required: "Yazar adı bilgisi gereklidir.",
                                            minLength: {
                                                value: 3,
                                                message: "Yazar adı min. 3 karakter olmalıdır."
                                            }
                                        })} 
                                        id="name" 
                                        name="name" 
                                        className={`input w-full ${isMobile ? 'mt-2' : 'mt-4'}`}
                                    />
                                    {errors.name && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.name?.message?.toString()}</span>}
                                </div>
                            </div>

                            <div className={`flex ${isMobile ? 'flex-col gap-y-3 mt-6' : 'flex-row mt-10 gap-x-4'} ${isMobile ? 'px-0' : 'px-10 md:px-20'}`}>
                                <button 
                                    type="submit" 
                                    className={`button ${isMobile ? 'w-full' : 'w-1/2'} font-bold ${isMobile ? 'text-base py-3' : 'text-lg py-4'} hover:scale-105 duration-300`}
                                >
                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    Onayla
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => navigate(-1)} 
                                    className={`button ${isMobile ? 'w-full' : 'w-1/2'} !bg-red-500 font-bold ${isMobile ? 'text-base py-3' : 'text-lg py-4'} text-center hover:scale-105 duration-300`}
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                    Geri Dön
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            }
        </div>
    )
}