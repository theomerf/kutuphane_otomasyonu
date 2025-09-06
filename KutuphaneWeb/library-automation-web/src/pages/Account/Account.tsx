import { useState } from 'react'
import { Link, Outlet, } from 'react-router-dom'

export function Account() {
    const [activePanel, setActivePanel] = useState("login");

    return (
        <>
            <div className="flex justify-center content-center">
                <div className="content-center w-4/5 lg:w-[27%] p-0 my-10 border-none">
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