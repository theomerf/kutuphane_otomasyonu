import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../store/store";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import requests from "../services/api";

export default function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user } = useSelector((state: RootState) => state.account);
  const [hasChecked, setHasChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!adminOnly) {
      const timer = setTimeout(() => {
        setHasChecked(true);
      }, 100);

      return () => clearTimeout(timer);
    }
    else {
      const check = async () => {
        await requests.admin.getAdminDashboard();
        setHasChecked(true);
      }
      check().catch(() => {
        setIsAdmin(false);
        setHasChecked(true);
      });
      setIsAdmin(true);
    }

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

  if (adminOnly) {
    if (!isAdmin) {
      toast.error("Bu sayfayı görüntüleme yetkiniz yok.");
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}