import { useEffect, useReducer, useState } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type Account from "../../../../types/account";
import BackendDataObjectReducer from "../../../../types/backendDataObject";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";

export function UpdateAccount() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [roles, setRoles] = useState<string[]>([]);
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    const [accountDetail, dispatch] = useReducer(BackendDataObjectReducer<Account>, {
        data: null,
        isLoading: false,
        error: null
    });
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            id: "",
            userName: "",
            avatarUrl: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            birthDate: "",
            roles: [] as string[],
        }
    });

    const fetchAccount = async (id: string, signal: AbortSignal) => {
        dispatch({ type: 'FETCH_START' });
        try {
            const response = await requests.account.getOneAccount(id, signal);
            dispatch({ type: 'FETCH_SUCCESS', payload: response.data as Account });
        } catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                console.error('Hata:', error);
                dispatch({ type: 'FETCH_ERROR', payload: error.message || 'Hata oluştu' });
            }
        }
    };

    useEffect(() => {
        if (accountDetail.data) {
            reset({
                id: accountDetail.data.id,
                userName: accountDetail.data.userName,
                avatarUrl: accountDetail.data.avatarUrl,
                firstName: accountDetail.data.firstName,
                lastName: accountDetail.data.lastName,
                phoneNumber: accountDetail.data.phoneNumber,
                email: accountDetail.data.email,
                birthDate: accountDetail.data.birthDate ? new Date(accountDetail.data.birthDate).toISOString().split('T')[0] : "",
                roles: accountDetail.data.roles,
            });
        }
    }, [accountDetail.data, reset]);

    const fetchRoles = async (signal: AbortSignal) => {
        try {
            const response = await requests.account.getAllRoles(signal);
            return response.data as string[];
        } catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return [];
            }
            else {
                console.error('Roller alınırken hata oluştu:', error);
                return [];
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadRoles = async () => {
            try {
                const roles = await fetchRoles(controller.signal);

                if (roles!.length > 0) {
                    setRoles(roles!);
                }
            }
            catch (error: any) {
                if (error.name === "CanceledError" || error.name === "AbortError") {
                    return;
                }
                else {
                    console.error('Roller alınırken hata oluştu:', error);
                }
            }
        };
        const id = window.location.pathname.split('/').pop() || "";
        fetchAccount(id, controller.signal);
        loadRoles();

        return () => {
            controller.abort();
        };
    }, []);

    const handleAccountUpdate = async (formData: any) => {
        try {
            setIsLoading(true);

            await requests.account.updateAccount(formData);

            toast.success('Kullanıcı başarıyla güncellendi!');
            navigate('/admin/accounts');

        } catch (error: any) {
            console.error('Oluşturma hatası:', error);
            toast.error('Kullanıcı güncellenirken hata oluştu.');
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
        <div className={`flex flex-col ${isMobile ? 'px-4 w-full' : 'px-8 w-full lg:px-80'}`}>
            <form method="POST" onSubmit={handleSubmit(handleAccountUpdate)} noValidate>
                <div className={`${isMobile ? 'py-6' : 'py-10'} text-center bg-violet-500 rounded-tl-lg rounded-tr-lg`}>
                    <p className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-2xl md:text-3xl'}`}>
                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                        {isMobile ? `${accountDetail.data?.userName} - Güncelle` : `Kullanıcı Adı: ${accountDetail.data?.userName} - Güncelle`}
                    </p>
                </div>
                <div className={`flex flex-col ${isMobile ? 'gap-y-4 px-4 py-6' : 'gap-y-6 px-8 py-10'} rounded-lg shadow-xl bg-white border border-gray-200`}>
                    <div className={`flex ${isMobile ? 'flex-col gap-y-4' : 'flex-row gap-x-10'}`}>
                        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-1/2'}`}>
                            <label htmlFor="userName" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>Kullanıcı Adı</label>
                            <input type="text" {...register("userName", {
                                required: "Kullanıcı adı gereklidir.",
                                minLength: {
                                    value: 3,
                                    message: "Kullanıcı adı min. 3 karakter olmalıdır."
                                },
                                maxLength: {
                                    value: 20,
                                    message: "Kullanıcı adı max. 20 karakter olmalıdır."
                                }
                            })} id="userName" name="userName" className={`input w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
                            {errors.userName && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.userName?.message?.toString()}</span>}
                        </div>
                        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-1/2'}`}>
                            <label htmlFor="birthDate" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>Doğum Tarihi</label>
                            <input type="date" {...register("birthDate", {
                                required: "Doğum tarihi gereklidir.",
                            })} id="birthDate" name="birthDate" className={`input w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
                            {errors.birthDate && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.birthDate?.message?.toString()}</span>}
                        </div>
                    </div>
                    <div className={`flex ${isMobile ? 'flex-col gap-y-4' : 'flex-row gap-x-10'}`}>
                        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-1/2'}`}>
                            <label htmlFor="firstName" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>Ad</label>
                            <input type="text" {...register("firstName", {
                                required: "Ad gereklidir.",
                                minLength: {
                                    value: 2,
                                    message: "Ad minimum 2 karakter olmalıdır."
                                },
                                maxLength: {
                                    value: 13,
                                    message: "Ad en fazla 20 karakter olmalıdır."
                                }
                            })} id="firstName" name="firstName" className={`input w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
                            {errors.firstName && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.firstName?.message?.toString()}</span>}
                        </div>
                        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-1/2'}`}>
                            <label htmlFor="lastName" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>Soyad</label>
                            <input type="text" {...register("lastName", {
                                required: "Soyad gereklidir.",
                                min: {
                                    value: 2,
                                    message: "Soyad minimum 2 karakter olmalıdır."
                                },
                                max: {
                                    value: 20,
                                    message: "Soyad en fazla 20 karakter olmalıdır."
                                },
                            })} id="lastName" name="lastName" className={`input w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
                            {errors.lastName && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.lastName?.message?.toString()}</span>}
                        </div>
                    </div>
                    <div className={`flex ${isMobile ? 'flex-col gap-y-4' : 'flex-row gap-x-10'}`}>
                        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-1/2'}`}>
                            <label htmlFor="phoneNumber" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>Telefon Numarası</label>
                            <input type="text" {...register("phoneNumber", {
                                required: "Telefon numarası gereklidir.",
                            })} id="phoneNumber" name="phoneNumber" className={`input w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
                            {errors.phoneNumber && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.phoneNumber?.message?.toString()}</span>}
                        </div>
                        <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-1/2'}`}>
                            <label htmlFor="email" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>E-Posta</label>
                            <input type="text" {...register("email", {
                                required: "Email gereklidir.",
                            })} id="email" name="email" className={`input w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
                            {errors.email && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.email?.message?.toString()}</span>}
                        </div>
                    </div>

                    <div className="flex flex-col w-full">
                        <label htmlFor="roles" className={`font-bold text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>Roller</label>
                        {roles.length > 0 && roles.map((role) => (
                            <div key={role} className="flex items-center mt-2">
                                <input type="checkbox" value={role} {...register("roles", {
                                    required: "En az bir rol seçilmelidir."
                                })} id={role} name="roles" className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded" />
                                <label htmlFor={role} className={`ml-2 block text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>{role}</label>
                            </div>
                        ))}
                        {errors.roles && <span className="text-red-700 text-xs md:text-sm text-left mt-1">{errors.roles?.message?.toString()}</span>}
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