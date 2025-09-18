import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { ClipLoader } from 'react-spinners';
import { faUser, faLock, faRightToBracket, faInfo, faPhone, faCakeCandles, faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from './accountSlice';
import { useForm } from 'react-hook-form';
import type { RootState, AppDispatch } from '../../store/store.ts'
import { ErrorDisplay } from '../../components/ui/ErrorDisplay.tsx';

export default function Register() {
    const dispatch: AppDispatch = useDispatch();
    const [passwordVisibleForRegister, setPasswordVisibleForRegister] = useState(false);
    const { status, error } = useSelector((state: RootState) => state.account);
    const { register, handleSubmit, formState: { errors } } = useForm();

    async function handleRegister(data: any) {
        dispatch(registerUser(data));
    }

    return (
        <div className="py-3 px-8" id="authTabPane" role="tabpanel">
            <form method="POST" onSubmit={handleSubmit(handleRegister)} noValidate>
                <ErrorDisplay error={error!} />
                <div className="my-5 flex flex-col">
                    <label className="label" htmlFor="userName">
                        <FontAwesomeIcon className="mr-1" icon={faUser} />
                        Kullanıcı Adı:
                    </label>
                    <input type="text" {...register("UserName", {
                        required: "Kullanıcı adı gereklidir.",
                        minLength: {
                            value: 6,
                            message: "Kullanıcı adı minimum 6 karakter olmalıdır."
                        },
                        maxLength: {
                            value: 20,
                            message: "Kullanıcı adı en fazla 20 karakter olmalıdır.",
                        }
                    })} id="userName" name="UserName" className="input" placeholder="Kullanıcı adınızı giriniz."></input>
                    {errors.UserName && <span className="text-red-700 text-left mt-1">{errors.UserName?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="label" htmlFor="firstName">
                        <FontAwesomeIcon className="mr-1" icon={faInfo} />
                        Ad:
                    </label>
                    <input type="text" {...register("FirstName", {
                        required: "Ad gereklidir.",
                        minLength: {
                            value: 2,
                            message: "Ad minimum 2 karakter olmalıdır."
                        },
                        maxLength: {
                            value: 20,
                            message: "Ad en fazla 20 karakter olmalıdır.",
                        }
                    })}
                        id="firstName" name="FirstName" className="input" placeholder="Adınızı giriniz."></input>
                    {errors.FirstName && <span className="text-red-700 text-left mt-1">{errors.FirstName?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="label" htmlFor="lastName">
                        <FontAwesomeIcon className="mr-1" icon={faInfo} />
                        Soyad:
                    </label>
                    <input type="text" {...register("LastName", {
                        required: "Soyad gereklidir.",
                        minLength: {
                            value: 2,
                            message: "Soyad minimum 2 karakter olmalıdır."
                        },
                        maxLength: {
                            value: 20,
                            message: "Soyad en fazla 20 karakter olmalıdır.",
                        }
                    })}
                        id="lastName" name="LastName" className="input" placeholder="Soyadınızı giriniz."></input>
                    {errors.LastName && <span className="text-red-700 text-left mt-1">{errors.LastName?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="label" htmlFor="phoneNumber">
                        <FontAwesomeIcon className="mr-1" icon={faPhone} />
                        Telefon Numarası
                    </label>
                    <input type="text" {...register("PhoneNumber", {
                        required: "Telefon numarası gereklidir.",
                    })}
                        id="phoneNumber" name="PhoneNumber" className="input" placeholder="Telefon numaranızı giriniz."></input>
                    {errors.PhoneNumber && <span className="text-red-700 text-left mt-1">{errors.PhoneNumber?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="label" htmlFor="birthDate">
                        <FontAwesomeIcon className="mr-1" icon={faCakeCandles} />
                        Doğum Tarihi
                    </label>
                    <input type="date" {...register("BirthDate", {
                        required: "Doğum tarihi gereklidir.",
                    })}
                        id="birthDate" name="BirthDate" className="input" placeholder="Doğum tarihinizi giriniz."></input>
                    {errors.BirthDate && <span className="text-red-700 text-left mt-1">{errors.BirthDate?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="label" htmlFor="email">
                        <FontAwesomeIcon className="mr-1" icon={faEnvelope} />
                        E-Posta
                    </label>
                    <input type="email" {...register("Email", {
                        required: "Email gereklidir.",
                    })}
                        id="email" name="Email" className="input" placeholder="E-postanızı giriniz."></input>
                    {errors.Email && <span className="text-red-700 text-left mt-1">{errors.Email?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col relative">
                    <label className="label" htmlFor="password">
                        <FontAwesomeIcon className="mr-1" icon={faLock} />
                        Şifre:
                    </label>
                    <div className="flex w-full">
                        <input type={passwordVisibleForRegister ? "text" : "password"} {...register("Password", {
                            required: "Şifre gereklidir.",
                            minLength: {
                                value: 6,
                                message: "Şifre min. 6 karakter olmalıdır."
                            },
                            maxLength: {
                                value: 20,
                                message: "Şifre en fazla 20 karakter olmalıdır.",
                            }
                        })}
                            id="password" name="Password" className="passwordInput" placeholder="Şifrenizi giriniz."></input>
                        <button type="button" onClick={passwordVisibleForRegister ? () => setPasswordVisibleForRegister(false) : () => setPasswordVisibleForRegister(true)} className="cursor-pointer border-2 border-[#e5e7eb] border-l-0 rounded-[0_12px_12px_0] text-white bg-hero-gradient px-4 py-3 transform transition-all duration-500 hover:bg-violet-400  hover:shadow-md hover:transition-all hover:scale-105">
                            <FontAwesomeIcon icon={passwordVisibleForRegister ? faEyeSlash : faEye} title={passwordVisibleForRegister ? "Gizle" : "Göster"} />
                        </button>
                    </div>
                    {errors.Password && <span className="text-red-700 text-left mt-1">{errors.Password?.message?.toString()}</span>}
                </div>
                <div className="my-5">
                    <button type="submit" className="button w-full text-lg font-semibold hover:scale-105">
                        {status === "pending" ? (
                            <ClipLoader size={20} className="justify-center align-middle text-center" color="#fff" />
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faRightToBracket} className="mr-2" />
                                Kayıt Ol
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}