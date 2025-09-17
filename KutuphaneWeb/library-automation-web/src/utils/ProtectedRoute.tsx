import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../store/store";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function ProtectedRoute() {
  const { user } = useSelector((state: RootState) => state.account);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasChecked(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader size={40} color="#8B5CF6" />
      </div>
    );
  }

  if (!user) {
    toast.warning("Bu sayfayı görüntülemek için giriş yapmalısınız.");
    return <Navigate to="/Account/Login" replace />;
  }

  return <Outlet />;
}