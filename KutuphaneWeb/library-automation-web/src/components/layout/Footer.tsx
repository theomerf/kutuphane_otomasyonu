import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
    return (
        <div className="flex flex-col bg-hero-gradient pt-10 px-10 pb-4 text-white">
            <div className="grid grid-cols-3">
                <div className="flex flex-col col-span-1">
                    <p className="font-semibold text-xl">Sosyal Medya Hesaplarımız</p>
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:underline mt-4">
                        <FontAwesomeIcon icon={faFacebook} className="mr-2" />
                        Facebook
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline mt-2">
                        <FontAwesomeIcon icon={faTwitter} className="mr-2" />
                        Twitter
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:underline mt-2">
                        <FontAwesomeIcon icon={faInstagram} className="mr-2" />
                        Instagram
                    </a>
                </div>
                <div className="flex flex-col col-span-1">
                    <p className="font-semibold text-xl">İletişim</p>
                    <p className="mt-4">Adres: 123 Kütüphane Sokak, Şehir, Ülke</p>
                    <p className="mt-2">Telefon: (123) 456-7890</p>
                    <p className="mt-2">Email: kutuphane@gmail.com</p>
                </div>
                <div className="flex flex-col col-span-1">
                    <p className="font-semibold text-xl">Çalışma Saatleri</p>
                    <p className="mt-4">Pazartesi - Cuma: 08:30 - 22:00</p>
                    <p className="mt-2">Cumartesi: 10:00 - 18:00</p>
                    <p className="mt-2">Pazar: Kapalı</p>
                </div>
            </div>
            <div className="text-center mt-10">
                &copy; {new Date().getFullYear()} Kütüphane Otomasyon Sistemi. Tüm hakları saklıdır.
            </div>
        </div>
    )
}