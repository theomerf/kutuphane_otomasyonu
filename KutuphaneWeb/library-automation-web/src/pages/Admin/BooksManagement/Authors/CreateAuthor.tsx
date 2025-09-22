import { useState } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export function CreateAuthor() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
        }
    });

    const handleAuthorCreation = async (formData: any) => {
        try {
            setIsLoading(true);
            await requests.authors.createAuthor(formData);

            toast.success('Yazar başarıyla oluşturuldu!');
            navigate('/admin/authors');

        } catch (error: any) {
            console.error('Oluşturma hatası:', error);
            toast.error('Yazar oluşturulurken hata oluştu.');
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
            <form method="POST" onSubmit={handleSubmit(handleAuthorCreation)} noValidate>
                <div className="py-10 text-center bg-violet-500 rounded-tl-lg rounded-tr-lg">
                    <p className="text-white font-bold text-3xl">
                        <FontAwesomeIcon icon={faLayerGroup} className="mr-2" />
                        Yeni Yazar Ekle
                    </p>
                </div>
                <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 py-10">

                    <div className="flex flex-row gap-x-10 justify-center">
                        <div className="flex flex-col w-3/5">
                            <label htmlFor="name" className="font-bold text-gray-500 text-base">Yazar Adı</label>
                            <input type="text" {...register("name", {
                                required: "Yazar adı bilgisi gereklidir.",
                                minLength: {
                                    value: 3,
                                    message: "Yazar adı min. 3 karakter olmalıdır."
                                }
                            })} id="name" name="name" className="input w-full mt-4" />
                            {errors.name && <span className="text-red-700 text-left mt-1">{errors.name?.message?.toString()}</span>}
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
                        <Link to="/admin/authors" className="button w-1/2 !bg-red-500 font-bold !py-4 text-center text-lg hover:scale-105 duration-300">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Geri Dön
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}