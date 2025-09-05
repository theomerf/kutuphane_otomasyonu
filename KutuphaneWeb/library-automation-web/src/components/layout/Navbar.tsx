import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faHeart, faRightFromBracket, faRightToBracket, faSearch } from "@fortawesome/free-solid-svg-icons";
import Logo from "../../assets/icon.png"; // kendi logonu import et
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState } from '../../store/store'
import { useNavigate } from "react-router-dom"; 
import { logout } from '../../pages/Account/accountSlice'

export default function Navbar() {
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
  const { user } = useAppSelector((state) => state.account);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }


  return (
    <>
      <nav className="navbar py-0">
        <div className="flex items-center justify-between w-full px-10 py-6">
          {/* Sol Kısım */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={Logo} alt="Logo" className="h-9 hover:rotate-45 hover:scale-125 duration-500" />
            <span className="text-2xl font-semibold text-white">Kütüphane Otomasyonu</span>
          </Link>

          {/* Orta Kısım*/}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1/3">
            <input
              type="text"
              placeholder="Kitap, yazar, kategori ara..."
              className="w-full rounded-3xl h-12 px-4 border-2 placeholder:text-white border-white/10 shadow-inner shadow-black/10 bg-white/10 text-white focus:border-blue-500 focus:outline-none focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2),inset_0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-tr-3xl rounded-b-3xl rounded-l-none bg-violet-600 flex items-center justify-center text-white hover:bg-violet-500 hover:scale-105 transition-all duration-500">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>

          <div className="flex gap-5">
            {/* Sağ Kısım */}
            {
              user ? (
                <>
                  <Link to="/Account/Notifications" title="Bildirimler" className="navButton">
                    <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
                  </Link>
                  <Link to="/Account/Favourites" title="Favoriler" className="navButton">
                    <FontAwesomeIcon icon={faHeart} />
                  </Link>
                  <Link to="/Account" className="button">
                    <p>{user.userName}</p>
                  </Link>
                  <button onClick={handleLogout} className="button">
                    <FontAwesomeIcon icon={faRightFromBracket} />Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link to="/Account/Login" className="button">
                    <FontAwesomeIcon icon={faRightToBracket} className="mr-2" />
                    Giriş Yap
                  </Link>
                </>
              )
            }

          </div>

        </div>
      </nav>

      {/* Alt navbar */}
      <nav className="mt-[95px] bg-violet-400 py-3 rounded-b-3xl backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <ul className="flex justify-center space-x-8 font-medium text-sm">
            <li className="hover:scale-110 transition-all duration-500">
              <Link to="/Books" className="navButton">
                Kitaplar
              </Link>
            </li>
            <li className="hover:scale-110 transition-all duration-500">
              <Link to="/Reservations" className="navButton">
                Rezervasyon
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
