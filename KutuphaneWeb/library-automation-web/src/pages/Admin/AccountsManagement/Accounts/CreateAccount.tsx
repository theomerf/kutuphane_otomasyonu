import { useEffect, useState } from "react";
import requests from "../../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faEye, faEyeSlash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export function CreateAccount() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [roles, setRoles] = useState<string[]>([]);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            userName: "",
            avatarUrl: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            birthDate: "",
            roles: [] as string[],
            password: ""
        }
    });

    const fetchRoles = async () => {
        try {
            const response = await requests.account.getAllRoles();
            return response.data as string[];
        } catch (error) {
            console.error('Roller alınırken hata oluştu:', error);
            return [];
        }
    };

    useEffect(() => {
        const loadRoles = async () => {
            const roles = await fetchRoles();
            if (roles.length > 0) {
                setRoles(roles);
            }
        };
        loadRoles();
    }, []);

    const handleAccountCreation = async (formData: any) => {
        try {
            setIsLoading(true);

            await requests.account.createAccount(formData);

            toast.success('Kullanıcı başarıyla oluşturuldu!');
            navigate('/admin/accounts');

        } catch (error: any) {
            console.error('Oluşturma hatası:', error);
            toast.error('Kullanıcı oluşturulurken hata oluştu.');
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
        <div className="flex flex-col px-8 lg:px-80">
            <form method="POST" onSubmit={handleSubmit(handleAccountCreation)} noValidate>
                <div className="py-10 text-center bg-violet-500 rounded-tl-lg rounded-tr-lg">
                    <p className="text-white font-bold text-3xl">
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Yeni Kullanıcı Ekle
                    </p>
                </div>
                <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 px-8 py-10">
                    <div className="flex flex-col w-full">
                        <label htmlFor="userName" className="font-bold text-gray-500 text-base">Kullanıcı Adı</label>
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
                        })} id="userName" name="userName" className="input w-full mt-4" />
                        {errors.userName && <span className="text-red-700 text-left mt-1">{errors.userName?.message?.toString()}</span>}
                    </div>
                    <div className="flex flex-row gap-x-10">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="firstName" className="font-bold text-gray-500 text-base">Ad</label>
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
                            })} id="firstName" name="firstName" className="input w-full mt-4" />
                            {errors.firstName && <span className="text-red-700 text-left mt-1">{errors.firstName?.message?.toString()}</span>}
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="lastName" className="font-bold text-gray-500 text-base">Soyad</label>
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
                            })} id="lastName" name="lastName" className="input w-full mt-4" />
                            {errors.lastName && <span className="text-red-700 text-left mt-1">{errors.lastName?.message?.toString()}</span>}
                        </div>
                    </div>
                    <div className="flex flex-row gap-x-10">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="phoneNumber" className="font-bold text-gray-500 text-base">Telefon Numarası</label>
                            <input type="text" {...register("phoneNumber", {
                                required: "Telefon numarası gereklidir.",
                            })} id="phoneNumber" name="phoneNumber" className="input w-full mt-4" />
                            {errors.phoneNumber && <span className="text-red-700 text-left mt-1">{errors.phoneNumber?.message?.toString()}</span>}
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="email" className="font-bold text-gray-500 text-base">E-Posta</label>
                            <input type="text" {...register("email", {
                                required: "Email gereklidir.",
                            })} id="email" name="email" className="input w-full mt-4" />
                            {errors.email && <span className="text-red-700 text-left mt-1">{errors.email?.message?.toString()}</span>}
                        </div>
                    </div>
                    <div className="flex flex-row gap-x-10">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="birthDate" className="font-bold text-gray-500 text-base">Doğum Tarihi</label>
                            <input type="date" {...register("birthDate", {
                                required: "Doğum tarihi gereklidir.",
                            })} id="birthDate" name="birthDate" className="input w-full mt-4" />
                            {errors.birthDate && <span className="text-red-700 text-left mt-1">{errors.birthDate?.message?.toString()}</span>}
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="password" className="font-bold text-gray-500 text-base">Şifre</label>
                            <div className="flex mt-4">
                                <input type={`${passwordVisible ? 'text' : 'password'}`} {...register("password", {
                                    required: "Şifre gereklidir.",
                                    minLength: {
                                        value: 6,
                                        message: "Şifre min. 6 karakter olmalıdır."
                                    },
                                    maxLength: {
                                        value: 20,
                                        message: "Şifre max. 20 karakter olmalıdır."
                                    }
                                })} id="password" name="password" className="passwordInput" />
                                <button type="button" onClick={passwordVisible ? () => setPasswordVisible(false) : () => setPasswordVisible(true)} className="cursor-pointer border-2 border-[#e5e7eb] border-l-0 rounded-[0_12px_12px_0] text-white bg-hero-gradient px-4 py-3 transform transition-all duration-500 hover:bg-violet-400  hover:shadow-md hover:transition-all hover:scale-105">
                                    <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} title={passwordVisible ? "Gizle" : "Göster"} />
                                </button>
                            </div>
                            {errors.password && <span className="text-red-700 text-left mt-1">{errors.password?.message?.toString()}</span>}
                        </div>
                    </div>

                    <div className="flex flex-col w-full">
                        <label htmlFor="roles" className="font-bold text-gray-500 text-base">Roller</label>
                        {roles.length > 0 && roles.map((role) => (
                            <div key={role} className="flex items-center mt-2">
                                <input type="checkbox" value={role} {...register("roles", {
                                    required: "En az bir rol seçilmelidir."
                                })} id={role} name="roles" className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded" />
                                <label htmlFor={role} className="ml-2 block text-gray-700">{role}</label>
                            </div>
                        ))}
                        {errors.roles && <span className="text-red-700 text-left mt-1">{errors.roles?.message?.toString()}</span>}
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
                        <Link to="/admin/accounts" className="button w-1/2 !bg-red-500 font-bold !py-4 text-center text-lg hover:scale-105 duration-300">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Geri Dön
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}