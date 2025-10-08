import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="flex flex-col gap-y-8 text-center m-4 lg:m-20 mt-10 shadow-lg rounded-lg border-gray-200 px-10 py-14 border">
            <FontAwesomeIcon icon={faQuestion} className="text-violet-400 text-5xl animate-pulse self-center" />
            <div>
                <p className="text-gray-500 text-3xl font-bold">Aradığınız sayfa bulunamadı.</p>
                <p className="text-gray-400 mt-2">Lütfen URL'yi kontrol edin veya anasayfaya dönün.</p>
            </div>

            <Link to="/" className="button w-fit self-center hover:scale-105">Anasayfaya Dön</Link>
        </div>
    )
}