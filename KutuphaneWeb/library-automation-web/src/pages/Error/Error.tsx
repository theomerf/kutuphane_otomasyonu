import { useLocation } from "react-router-dom"

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
                <div>
                    {state.error} - {state.status}
                </div>
                </>
            ) : (
                <>
                <div>
                    Server Error - Bilinmeyen bir hata
                </div>
                </>
            )
            }
        </div>
    )
}