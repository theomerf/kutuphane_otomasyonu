import { useEffect, useState } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type Category from "../../../../types/category";
import { toast } from "react-toastify";

type CategoryDetail = {
    error: string | null;
    category?: Category | null;
    loading: boolean;
}

export function UpdateCategory() {
    const navigate = useNavigate();
    const [categoryDetail, setCategoryDetail] = useState<CategoryDetail>({
        error: null,
        category: null,
        loading: false
    });
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            id: 0,
            name: "",
            parentId: 0,
        }
    });

    const fetchSelectionLists = async () => {
        try {
            const categoriesRes = await requests.categories.getAllCategoriesWithoutPagination();

            setAllCategories(categoriesRes.data || []);
        } catch (error) {
            console.error("Seçim listeleri yüklenirken hata:", error);
        }
    };

    useEffect(() => {
        fetchSelectionLists();
    }, []);

    useEffect(() => {
        if (categoryDetail.category) {
            reset({
                id: categoryDetail.category.id || 0,
                name: categoryDetail.category.name || "",
                parentId: categoryDetail.category.parentId || 0,
            });
        }
    }, [categoryDetail.category, reset]);

    const fetchCategories = async (id: string, signal?: AbortSignal) => {
        try {
            setCategoryDetail(prev => ({
                ...prev,
                loading: true,
            }));
            const response = await requests.categories.getOneCategory(parseInt(id), signal);

            setCategoryDetail({
                category: response.data as Category,
                loading: false,
                error: null
            });
        }
        catch (error) {
            setCategoryDetail({
                category: null,
                loading: false,
                error: 'Kategori bilgileri çekilirken hata oluştu.'
            });
            throw error;
        }
    };

    const handleCategoryUpdate = async (formData: any) => {
        try {
            await requests.categories.updateCategory(formData);

            toast.success('Kategori başarıyla güncellendi!');
            navigate('/admin/categories');

        } catch (error: any) {
            console.error('Güncelleme hatası:', error);
            toast.error('Güncelleme sırasında hata oluştu.');
        }
    };

    useEffect(() => {
        const id: string = window.location.pathname.split('/').pop() || '';
        fetchCategories(id);
    }, []);

    return (
        <div className="flex justify-center"> 
            {(categoryDetail.loading) && (
                <div className="flex justify-center items-center h-64">
                    <ClipLoader size={40} color="#8B5CF6" />
                </div>
            )}

            {categoryDetail.error && (
                <div className="flex justify-center items-center h-64 text-red-500">
                    {categoryDetail.error}
                </div>
            )}
            {categoryDetail.category && !categoryDetail.loading &&
                <div className="flex flex-col px-8 w-2/5">
                    <form method="POST" onSubmit={handleSubmit(handleCategoryUpdate)} noValidate>
                        <div className="py-10 text-center bg-violet-500 rounded-tl-lg rounded-tr-lg">
                            <p className="text-white font-bold text-3xl">
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Kategori Id: {categoryDetail.category.id} - Düzenle
                            </p>
                        </div>
                        <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 px-8 py-10">
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
                                <button type="submit" className="button w-1/2 font-bold text-lg !py-4 hover:scale-105 duration-300">
                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    Onayla
                                </button>
                                <Link to="/admin/categories" className="button w-1/2 !bg-red-500 font-bold !py-4 text-center text-lg hover:scale-105 duration-300">
                                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                    Geri Dön
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            }
        </div>
    )
}