import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.tsx'
import Footer from './Footer.tsx'

export default function MainLayout(){
    return (
        <div className="flex flex-col min-h-screen bg-[#FFF0F0] font-segoe text-[#495057]">
            <Navbar />

            <main className="flex-grow mt-10 ">
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}