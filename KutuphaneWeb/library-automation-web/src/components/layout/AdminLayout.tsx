import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer.tsx'
import { AnimatePresence, motion } from "framer-motion";
import AdminNavbar from './AdminNavbar.tsx';

export default function AdminLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen">
            <AdminNavbar />

            <main className="flex-grow pt-16 pb-10 my-5">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    )
}