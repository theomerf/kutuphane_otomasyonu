import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBars, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Logo from "../../assets/icon.png";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from '../../store/store'
import { useNavigate } from "react-router-dom";
import { logout } from '../../pages/Account/accountSlice'
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useState } from "react";

type LinkType = {
    name: string;
    to: string;
}

const links: LinkType[] = [
    { name: "Kitaplar", to: "admin/books" },
    { name: "Rezervasyon", to: "admin/reservation" }
]

export default function AdminNavbar() {
    const [open, setOpen] = useState(false);
    const { user } = useSelector((state: RootState) => state.account);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const { down, up } = useBreakpoint();

    function handleLogout() {
        dispatch(logout());
        navigate("/");
    }


    return (
        <>
            <nav className="navbar py-0">
                <div className="flex items-center justify-between w-full px-4 py-3 lg:px-10 lg:py-6">
                    {/* Sol Kısım */}
                    <Link to="/admin" className="flex items-center space-x-2 lg:space-x-3">
                        <img src={Logo} alt="Logo" className="h-8 lg:h-9 hover:rotate-45 hover:scale-125 duration-500" />
                        <span className="text-sm lg:text-2xl font-semibold  text-white">Kütüphane {up.lg ? "" : <br />} Otomasyonu / Admin Paneli</span>
                    </Link>

                    <div className="flex gap-5">
                        {/* Sağ Kısım */}
                        {
                            <>
                                {up.lg &&
                                    <>
                                        <Link to="/" title="Siteye geri dön" className="navButton">
                                            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                                        </Link>
                                        <Link to="/Account" className="navButton">
                                            <p>{user?.userName}</p>
                                        </Link>
                                    </>
                                }
                                <button onClick={handleLogout} className="navButton">
                                    <FontAwesomeIcon icon={faRightFromBracket} className="lg:mr-2" />
                                    {up.lg && "Çıkış Yap"}
                                </button>
                            </>
                        }
                        {down.lg &&
                            <button type="button" onClick={open ? () => setOpen(false) : () => setOpen(true)} className="navButton">
                                <FontAwesomeIcon icon={faBars}></FontAwesomeIcon>
                            </button>
                        }
                    </div>
                </div>
            </nav>

            {/* Mobil görünüm */}
            {open && down.lg &&
                <div className={`${user ? "mb-[-18%]" : "mb-[-18%]"} mt-[65px] bg-violet-400 py-3`}>
                    <div className="flex justify-center gap-2 mb-3">
                        <Link to="/" title="Siteye geri dön" className="navButton">
                            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                        </Link>
                        <Link to="/Account" className="navButton">
                            <p>{user?.userName}</p>
                        </Link>
                    </div>

                    <ul className="flex flex-col gap-3 font-medium text-sm">
                        {links.map((l) => (
                            <li key={l.name} className="hover:scale-110 px-8 transition-all duration-500">
                                <NavLink to={l?.to} className={({ isActive }) => `block text-center  ${isActive ? 'navButtonActive' : 'navButton'}`}>
                                    {l.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            }

            {/* Alt navbar */}
            {up.lg &&
                <nav className="mt-[65px] lg:mt-[95px] bg-violet-400 py-3 rounded-b-3xl backdrop-blur-md">
                    <div className="max-w-screen-xl mx-auto px-4 py-3">
                        <ul className="flex justify-center space-x-8 font-medium text-sm">
                            {links.map((l) => (
                                <li key={l.name} className="hover:scale-110 transition-all duration-500">
                                    <NavLink to={l?.to} className={({ isActive }) => `${isActive ? 'navButtonActive' : 'navButton'}`}>
                                        {l.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            }
        </>
    );
}
