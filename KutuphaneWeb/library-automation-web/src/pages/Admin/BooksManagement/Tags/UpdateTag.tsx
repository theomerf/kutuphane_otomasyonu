import { useEffect, useReducer } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type Tag from "../../../../types/tag";
import BackendDataObjectReducer from "../../../../types/backendDataObject";

export function UpdateTag() {
    const navigate = useNavigate();
    const [tagDetail, dispatch] = useReducer(BackendDataObjectReducer<Tag>, {
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
        if (tagDetail.data) {
            reset({
                id: tagDetail.data.id || 0,
                name: tagDetail.data.name || "",
            });
        }
    }, [tagDetail.data, reset]);

    const fetchTags = async (id: string, signal?: AbortSignal) => {
        dispatch({ type: 'FETCH_START' });
        try {
            const response = await requests.tags.getOneTag(parseInt(id), signal);
            dispatch({ type: 'FETCH_SUCCESS', payload: response.data as Tag });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                dispatch({ type: 'FETCH_ERROR', payload: error.message || 'Etiket bilgileri getirilirken bir hata oluştu.' });
            }
        }
    };

    const handleTagUpdate = async (formData: any) => {
        try {
            await requests.tags.updateTag(formData);

            toast.success('Etiket başarıyla güncellendi!');
            navigate('/admin/tags');

        } catch (error: any) {
            console.error('Güncelleme hatası:', error);
            toast.error('Güncelleme sırasında hata oluştu.');
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const id: string = window.location.pathname.split('/').pop() || '';
        fetchTags(id, controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <div className="flex justify-center">
            {(tagDetail.isLoading) && (
                <div className="flex justify-center items-center h-64">
                    <ClipLoader size={40} color="#8B5CF6" />
                </div>
            )}

            {tagDetail.error && (
                <div className="flex justify-center items-center h-64 text-red-500">
                    {tagDetail.error}
                </div>
            )}
            {tagDetail.data && !tagDetail.isLoading &&
                <div className="flex flex-col px-8 w-2/5">
                    <form method="POST" onSubmit={handleSubmit(handleTagUpdate)} noValidate>
                        <div className="py-10 text-center bg-violet-500 rounded-tl-lg rounded-tr-lg">
                            <p className="text-white font-bold text-3xl">
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Etiket Id: {tagDetail.data.id} - Düzenle
                            </p>
                        </div>
                        <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 px-8 py-10">
                            <div className="flex flex-row gap-x-10 justify-center">
                                <div className="flex flex-col w-3/5">
                                    <label htmlFor="name" className="font-bold text-gray-500 text-base">Etiket Adı</label>
                                    <input type="text" {...register("name", {
                                        required: "Etiket adı bilgisi gereklidir.",
                                        minLength: {
                                            value: 3,
                                            message: "Etiket adı min. 3 karakter olmalıdır."
                                        }
                                    })} id="name" name="name" className="input w-full mt-4" />
                                    {errors.name && <span className="text-red-700 text-left mt-1">{errors.name?.message?.toString()}</span>}
                                </div>
                            </div>

                            <div className="flex flex-row mt-10 gap-x-4 px-20">
                                <button type="submit" className="button w-1/2 font-bold text-lg !py-4 hover:scale-105 duration-300">
                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    Onayla
                                </button>
                                <button type="button" onClick={() => navigate(-1)} className="button w-1/2 !bg-red-500 font-bold !py-4 text-center text-lg hover:scale-105 duration-300">
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