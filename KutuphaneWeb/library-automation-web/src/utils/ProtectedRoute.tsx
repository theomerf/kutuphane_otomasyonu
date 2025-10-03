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

  const checkPermission = async (signal: AbortSignal) => {
    try {
      await requests.admin.getAdminDashboard(signal);
      setIsAdmin(true);
    }
    catch (error: any) {
      if (error.name === "CanceledError" || error.name === "AbortError") {
        setIsAdmin(true);
      }
      else {
        setIsAdmin(false);
      }
    }
    finally {
      setHasChecked(true);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    if (!adminOnly) {
      const timer = setTimeout(() => {
        setHasChecked(true);
      }, 100);

      return () => clearTimeout(timer);
    }
    else {
      checkPermission(controller.signal);

      return () => {
        controller.abort();
      };
    }

  }, []);

  useEffect(() => {
    if (hasChecked) {
      if (!user) {
        toast.warning("Bu sayfayı görüntülemek için giriş yapmalısınız.");
      } else if (adminOnly && !isAdmin) {
        toast.error("Bu sayfayı görüntüleme yetkiniz yok.");
      }
    }
  }, [hasChecked, user, isAdmin, adminOnly]);

  if (!hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader size={40} color="#8B5CF6" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/account/login" replace />;
  }

  if (adminOnly) {
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}