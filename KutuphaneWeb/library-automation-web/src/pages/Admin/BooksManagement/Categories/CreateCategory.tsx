import { useEffect, useState } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type Category from "../../../../types/category";
import { toast } from "react-toastify";

export function CreateCategory() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            parentId: 0,
        }
    });

    const fetchSelectionLists = async () => {
        try {
            setIsLoading(true);
            const categoriesRes = await requests.categories.getAllCategoriesWithoutPagination();

            setAllCategories(categoriesRes.data || []);
        } catch (error) {
            console.error("Kategori listesi yüklenirken hata:", error);
            toast.error("Kategori listesi yüklenirken hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSelectionLists();
    }, []);

    const handleCategoryCreation = async (formData: any) => {
        try {
            setIsLoading(true);
            await requests.categories.createCategory(formData);

            toast.success('Kategori başarıyla oluşturuldu!');
            navigate('/admin/categories');

        } catch (error: any) {
            console.error('Oluşturma hatası:', error);
            toast.error('Kategori oluşturulurken hata oluştu.');
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
            <form method="POST" onSubmit={handleSubmit(handleCategoryCreation)} noValidate>
                <div className="py-10 text-center bg-violet-500 rounded-tl-lg rounded-tr-lg">
                    <p className="text-white font-bold text-3xl">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Yeni Kategori Ekle
                    </p>
                </div>
                <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 py-10">

                    <div className="flex flex-row gap-x-10 justify-center">
                        <div className="flex flex-col w-3/5">
                            <label htmlFor="name" className="font-bold text-gray-500 text-base">Kategori Adı</label>
                            <input type="text" {...register("name", {
                                required: "Kategori adı bilgisi gereklidir.",
                                minLength: {
                                    value: 3,
                                    message: "Kategori adı min. 3 karakter olmalıdır."
                                }
                            })} id="name" name="name" className="input w-full mt-4" />
                            {errors.name && <span className="text-red-700 text-left mt-1">{errors.name?.message?.toString()}</span>}
                        </div>
                    </div>
                    <div className="flex flex-row gap-x-10 justify-center">
                        <div className="flex flex-col w-3/5">
                            <label htmlFor="parentId" className="font-bold text-gray-500 text-base">Üst Kategori (Varsa)</label>
                            <select {...register("parentId")} id="parentId" name="parentId" className="input w-full mt-4">
                                {allCategories.map((category) => (
                                    <option key={category.id} value={category.id!}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.parentId && <span className="text-red-700 text-left mt-1">{errors.parentId?.message?.toString()}</span>}
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