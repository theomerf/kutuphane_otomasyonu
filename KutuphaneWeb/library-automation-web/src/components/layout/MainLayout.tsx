import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.tsx'
import Footer from './Footer.tsx'

export default function MainLayout(){
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow pt-16 lg:pt-0">
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}