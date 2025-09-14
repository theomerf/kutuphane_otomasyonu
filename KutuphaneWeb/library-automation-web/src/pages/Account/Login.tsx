import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { faUser, faLock, faKey, faRightToBracket, faEye, faEyeSlash, faUserCheck } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from './accountSlice';
import { useForm } from 'react-hook-form';
import { ClipLoader } from 'react-spinners';
import type { RootState, AppDispatch } from '../../store/store.ts'
import { getCart, mergeCarts } from '../Cart/cartSlice.ts';

export default function Login() {

    const dispatch: AppDispatch = useDispatch();
    const { status, error } = useSelector((state: RootState) => state.account);
    const { cart } = useSelector((state: RootState) => state.cart);
    const [ passwordVisibleForLogin, setPasswordVisibleForLogin ] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    async function handleLogin(data: any) {
       const result = await dispatch(loginUser(data));

        if (loginUser.fulfilled.match(result)){
            if (cart && cart.cartLines && cart.cartLines.length > 0) {
                dispatch(mergeCarts(cart));
            }
            else {
                dispatch(getCart());
            }
        }
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
                    <div className="flex">
                        <input type={passwordVisibleForLogin ? "text" : "password"} {...register("Password", {
                            required: "Şifre gereklidir.",
                            minLength: {
                                value: 6,
                                message: "Şifre min. 6 karakter olmalıdır."
                            }
                        })}
                            id="password" name="Password" className="flex-1 border-2 border-[#e5e7eb] border-r-0 min-w-0 rounded-[12px_0_0_12px] px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)]  focus:scale-[102%] focus:bg-white/100" placeholder="Şifrenizi giriniz."></input>
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