import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBarsProgress, faBell, faCartShopping, faHeart, faRightFromBracket, faRightToBracket, faSearch } from "@fortawesome/free-solid-svg-icons";
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
  { name: "Kitaplar", to: "/books" },
  { name: "Rezervasyon", to: "/reservation" }
]

export default function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.account);
  const { cart } = useSelector((state: RootState) => state.cart);
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
          <Link to="/" className="flex items-center space-x-2 lg:space-x-3">
            <img src={Logo} alt="Logo" className="h-8 lg:h-9 hover:rotate-45 hover:scale-125 duration-500" />
            <span className="text-sm lg:text-2xl font-semibold  text-white">Kütüphane {up.lg ? "" : <br />} Otomasyonu</span>
          </Link>

          {/* Orta Kısım*/}
          <div className="absolute ml-2 lg:ml-0 left-1/2 transform -translate-x-1/2 w-1/4 lg:w-1/3">
            <input
              type="text"
              placeholder="Kitap, yazar, kategori ara..."
              className="w-full rounded-3xl h-12 px-4 border-2 placeholder:text-white border-white/10 shadow-inner shadow-black/10 bg-white/10 text-white focus:border-blue-500 focus:outline-none focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2),inset_0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 w-6 lg:w-10 h-10 rounded-tr-3xl rounded-b-3xl rounded-l-none bg-violet-600 flex items-center justify-center text-white hover:bg-violet-500 hover:scale-105 transition-all duration-500">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>

          <div className="flex gap-5">
            {/* Sağ Kısım */}
            {
              user ? (
                <>
                  {up.lg &&
                    <>
                      <Link to="/account/notifications" title="Bildirimler" className="navButton">
                        <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
                      </Link>
                      <Link to="/account/favourites" title="Favoriler" className="navButton">
                        <FontAwesomeIcon icon={faHeart} className="h-4 w-4" />
                      </Link>
                      {isAdmin ? (
                        <Link to="/admin" title="Admin Paneli" className="navButton">
                          <FontAwesomeIcon icon={faBarsProgress} className="h-4 w-4" />
                        </Link>
                      ) : (
                        <Link to="/account" className="navButton">
                          <p>{user?.userName}</p>
                        </Link>
                      )}
                      <Link to="/cart" className="navButton relative">
                        <FontAwesomeIcon icon={faCartShopping} />
                        <span className="absolute flex right-0 bottom-0 rounded-full w-5 h-5 text-sm bg-red-500 text-white justify-center font-semibold">
                          {cart?.cartLines?.length ?? 0}
                        </span>
                      </Link>
                    </>
                  }

                  <button onClick={handleLogout} className="navButton">
                    <FontAwesomeIcon icon={faRightFromBracket} className="lg:mr-2" />
                    {up.lg && "Çıkış Yap"}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/account/login" className="navButton">
                    <FontAwesomeIcon icon={faRightToBracket} className="lg:mr-2" />
                    {up.lg && "Giriş Yap"}
                  </Link>
                  {up.lg &&
                    <Link to="/cart" className="navButton relative">
                      <FontAwesomeIcon icon={faCartShopping} />
                      <span className="absolute flex right-0 bottom-0 rounded-full w-5 h-5 text-sm bg-red-500 text-white justify-center font-semibold">
                        {cart?.cartLines?.length ?? 0}
                      </span>
                    </Link>
                  }

                </>
              )
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
          {user ? (
            <div className="flex justify-center gap-2 mb-3">
              <Link to="/account/notifications" title="Bildirimler" className="navButton">
                <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
              </Link>
              <Link to="/account/favourites" title="Favoriler" className="navButton">
                <FontAwesomeIcon icon={faHeart} className="h-4 w-4" />
              </Link>
              {isAdmin ? (
                <Link to="/admin" title="Admin Paneli" className="navButton">
                  <FontAwesomeIcon icon={faBarsProgress} className="h-4 w-4" />
                </Link>
              ) : (
                <Link to="/account" className="navButton">
                  <p>{user?.userName}</p>
                </Link>
              )}
              <Link to="/cart" className="navButton relative">
                <FontAwesomeIcon icon={faCartShopping} />
                <span className="absolute flex right-[-5px] bottom-[-5px] rounded-full w-5 h-5 text-sm bg-red-500 text-white justify-center font-semibold">
                  {cart?.cartLines?.length ?? 0}
                </span>
              </Link>
            </div>
          ) :
            (
              <div className="flex justify-center gap-2 mb-3">
                <Link to="/cart" className="navButton relative">
                  <FontAwesomeIcon icon={faCartShopping} />
                  <span className="absolute flex right-[-5px] bottom-[-5px] rounded-full w-5 h-5 text-sm bg-red-500 text-white justify-center font-semibold">
                    {cart?.cartLines?.length ?? 0}
                  </span>
                </Link>
              </div>
            )

          }
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
