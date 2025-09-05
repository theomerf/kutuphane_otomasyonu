import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { ClipLoader } from 'react-spinners';
import { Link, Outlet, } from 'react-router-dom'
import { faUser, faLock, faKey, faRightToBracket, faInfo, faPhone, faCakeCandles, faEnvelope, faEye, faEyeSlash, faUserCheck } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from './accountSlice';
import { useForm } from 'react-hook-form';
import type { RootState, AppDispatch } from '../../store/store.ts'

export function Account() {
    const [activePanel, setActivePanel] = useState("login");

    return (
        <>
            <div className="flex justify-center content-center">
                <div className="content-center w-[27%] p-0 my-10 border-none">
                    <div className="flex flex-col justify-center align-center text-center rounded-2xl bg-violet-100 backdrop-blur-[20px] overflow-hidden before:content-none before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:pointer-events-none before:z-[1] transition-all shadow-sm hover:translate-y-[-5px] hover:shadow-lg duration-500">
                        <div className="flex py-2 border-none rounded-[16px 16px 0 0] pt-0 pb-0 bg-hero-gradient relative overflow-hidden after:content-none after:absolute after:bottom-0 after:left-0 after:right:0 after:h-[1px] after:bg-shine-gradient">
                            <Link to="/Account/Login" onClick={() => setActivePanel("login")} className={`${activePanel === "login" ? "" : "bg-violet-400 hover:bg-violet-600"} duration-300 py-5 flex-1 bg-transparent px-4 font-bold text-sm  text-white relative overflow-hidden before:content-none before:absolute before:-left-[100%] before:w-full before:h-full before:bg-hero-gradient before:transition-all before:duration-300 before:z-[-1] hover:text-black border-r border-violet-100 last:border-r-0`} id="loginTabBtn" type="button">
                                Giriş
                            </Link>

                            <Link to="/Account/Register" onClick={() => setActivePanel("register")} className={`${activePanel === "register" ? "" : "bg-violet-400 hover:bg-violet-600"} duration-300 py-5 flex-1 bg-transparent px-4 font-bold text-sm  text-white relative overflow-hidden before:content-none before:absolute before:-left-[100%] before:w-full before:h-full before:bg-hero-gradient before:transition-all before:duration-300 before:z-[-1] hover:text-black  border-r border-violet-100 last:border-r-0`} id="loginTabBtn" type="button">
                                Kayıt
                            </Link>
                        </div>
                        <div className="tab-content" id="authTabContent">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}

export function Login() {

    const dispatch: AppDispatch = useDispatch();
    const { status, error } = useSelector((state: RootState) => state.account);
    const [passwordVisibleForLogin, setPasswordVisibleForLogin] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    function handleLogin(data: any) {
        dispatch(loginUser(data));
    }

    return (
        <div className="py-3 px-8" id="loginTabPane" role="tabpanel">
            <form method="POST" onSubmit={handleSubmit(handleLogin)} noValidate>
                {error && <p className="text-red-700 text-left mt-2">{error}</p>}
                <div className="my-5 flex flex-col">
                    <label className="text-start font-bold color-[#374151] mb-2 text-sm" htmlFor="userName">
                        <FontAwesomeIcon className="mr-1" icon={faUser} />
                        Kullanıcı Adı:
                    </label>
                    <input type="text" {...register("UserName", {
                        required: "Kullanıcı adı gereklidir.",
                        minLength: {
                            value: 3,
                            message: "Kullanıcı adı min. 3 karakter olmalıdır."
                        }
                    })}
                        id="userName" name="UserName" className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="Kullanıcı adınızı giriniz."></input>
                    {errors.UserName && <span className="text-red-700 text-left mt-1">{errors.UserName?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col relative">
                    <label className="text-start font-bold color-[#374151] mb-2 text-sm" htmlFor="password">
                        <FontAwesomeIcon className="mr-1" icon={faLock} />
                        Şifre:
                    </label>
                    <div className="flex w-full">
                        <input type={passwordVisibleForLogin ? "text" : "password"} {...register("Password", {
                            required: "Şifre gereklidir.",
                            minLength: {
                                value: 6,
                                message: "Şifre min. 6 karakter olmalıdır."
                            }
                        })}
                            id="password" name="Password" className="flex-1 border-2 border-[#e5e7eb] border-r-0 rounded-[12px_0_0_12px] px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="Şifrenizi giriniz."></input>
                        <button type="button" onClick={passwordVisibleForLogin ? () => setPasswordVisibleForLogin(false) : () => setPasswordVisibleForLogin(true)} className="cursor-pointer border-2 border-[#e5e7eb] border-l-0 rounded-[0_12px_12px_0] text-white bg-hero-gradient px-4 py-3 transform transition-all duration-500 hover:bg-violet-400  hover:shadow-md hover:transition-all hover:scale-105">
                            <FontAwesomeIcon icon={passwordVisibleForLogin ? faEyeSlash : faEye} title={passwordVisibleForLogin ? "Gizle" : "Göster"} />
                        </button>
                    </div>
                    {errors.Password && <span className="text-red-700 text-left mt-1">{errors.Password?.message?.toString()}</span>}
                </div>
                <div className="mb-6 mt-10 flex align-center justify-between">
                    <div>
                        <input type="checkbox" {...register("RememberMe")}
                            id="RememberMe" name="RememberMe" className="rounded-md border-2 border-[#e5e7eb] accent-violet-600 transition-all duration-300 ease-in focus:shadow-sm"></input>
                        <label htmlFor="RememberMe" className="text-gray-500 font-medium">
                            <FontAwesomeIcon icon={faUserCheck} className="ml-2 mr-1" />
                            Beni Hatırla
                        </label>
                    </div>
                    <Link to="/Account/ForgotPassowrd" className="text-gray-500 font-medium hover:text-violet-600 transition-colors duration-300">
                        <FontAwesomeIcon icon={faKey} className="mr-1" />
                        <span></span>Şifremi Unuttum
                    </Link>
                </div>
                <div className="my-5">
                    <button type="submit" className="button w-full text-lg font-semibold hover:scale-105">
                        {status === "pending" ? (
                            <ClipLoader size={20} className="justify-center align-middle text-center" color="#fff" />
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faRightToBracket} className="mr-2" />
                                Giriş Yap
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export function Register() {
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
                {error && <p className="text-red-700 text-left mt-2">{error}</p>}
                <div className="my-5 flex flex-col">
                    <label className="text-start font-bold color-[#374151] mb-2 text-sm" htmlFor="userName">
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
                    })} id="userName" name="UserName" className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="Kullanıcı adınızı giriniz."></input>
                    {errors.UserName && <span className="text-red-700 text-left mt-1">{errors.UserName?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="text-start font-bold color-[#374151] mb-2 text-sm" htmlFor="firstName">
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
                        id="firstName" name="FirstName" className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="Adınızı giriniz."></input>
                    {errors.FirstName && <span className="text-red-700 text-left mt-1">{errors.FirstName?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="text-start font-bold color-[#374151] mb-2 text-sm" htmlFor="lastName">
                        <FontAwesomeIcon className="mr-1" icon={faInfo} />
                        Soyad:
                    </label>
                    <input type="text" {...register("LastName", {
                        required: "Soyad gereklidir.",
                        minLength: {
                            value: 6,
                            message: "Soyad minimum 2 karakter olmalıdır."
                        },
                        maxLength: {
                            value: 20,
                            message: "Soyad en fazla 20 karakter olmalıdır.",
                        }
                    })}
                        id="lastName" name="LastName" className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="Soyadınızı giriniz."></input>
                    {errors.LastName && <span className="text-red-700 text-left mt-1">{errors.LastName?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="text-start font-bold color-[#374151] mb-2 text-sm" htmlFor="phoneNumber">
                        <FontAwesomeIcon className="mr-1" icon={faPhone} />
                        Telefon Numarası
                    </label>
                    <input type="text" {...register("PhoneNumber", {
                        required: "Telefon numarası gereklidir.",
                    })}
                        id="phoneNumber" name="PhoneNumber" className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="Telefon numaranızı giriniz."></input>
                    {errors.PhoneNumber && <span className="text-red-700 text-left mt-1">{errors.PhoneNumber?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="text-start font-bold color-[#374151] mb-2 text-sm" htmlFor="birthDate">
                        <FontAwesomeIcon className="mr-1" icon={faCakeCandles} />
                        Doğum Tarihi
                    </label>
                    <input type="date" {...register("BirthDate", {
                        required: "Doğum tarihi gereklidir.",
                    })}
                        id="birthDate" name="BirthDate" className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="Doğum tarihinizi giriniz."></input>
                    {errors.BirthDate && <span className="text-red-700 text-left mt-1">{errors.BirthDate?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col">
                    <label className="text-start font-bold color-[#374151] mb-2 text-sm" htmlFor="email">
                        <FontAwesomeIcon className="mr-1" icon={faEnvelope} />
                        E-Posta
                    </label>
                    <input type="email" {...register("Email", {
                        required: "Email gereklidir.",
                    })}
                        id="email" name="Email" className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="E-postanızı giriniz."></input>
                    {errors.Email && <span className="text-red-700 text-left mt-1">{errors.Email?.message?.toString()}</span>}
                </div>
                <div className="my-5 flex flex-col relative">
                    <label className="text-start font-bold color-[#374151] mb-2 text-sm" htmlFor="password">
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
                            id="password" name="Password" className="flex-1 border-2 border-[#e5e7eb] border-r-0 rounded-[12px_0_0_12px] px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="Şifrenizi giriniz."></input>
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