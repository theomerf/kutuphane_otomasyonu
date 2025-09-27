import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom"

type ErrorLocationState = {
    error: string,
    status: number,
};

export default function Error() {
    const location = useLocation();
    const state = location.state as ErrorLocationState | null;

    return (
        <div>
            {state?.error ? (
                <>
                    <div className="flex flex-col gap-y-8 text-center m-20 shadow-lg rounded-lg border-gray-200 p-10 border">
                        <FontAwesomeIcon icon={faCircleExclamation} className="text-violet-400 text-5xl animate-pulse self-center" />
                        <div>
                            <p className="text-gray-500 text-3xl font-bold">{state.error}</p>
                            <p className="text-gray-400 text-lg font-bold mt-2">{state.status}</p>
                        </div>
                        <Link to="/" className="button w-fit self-center hover:scale-105">Anasayfaya Dön</Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-col gap-y-8 text-center m-20 shadow-lg rounded-lg border-gray-200 p-10 border">
                        <FontAwesomeIcon icon={faCircleExclamation} className="text-violet-400 text-5xl animate-pulse self-center" />
                        <div>
                            <p className="text-gray-500 text-3xl font-bold">Server Error</p>
                            <p className="text-gray-400 text-lg font-bold mt-2">Bilinmeyen Bir Hata Oluştu</p>
                        </div>
                        <Link to="/" className="button w-fit self-center hover:scale-105">Anasayfaya Dön</Link>
                    </div>
                </>
            )
            }
        </div>
    )
}