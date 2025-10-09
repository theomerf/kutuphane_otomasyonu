import { faCcMastercard, faCcVisa } from "@fortawesome/free-brands-svg-icons";
import { faArrowLeft, faCheck, faCreditCard, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../store/store";
import requests from "../../services/api";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { clearCart } from "../Cart/cartSlice";
import { useBreakpoint } from "../../hooks/useBreakpoint";

export default function Checkout() {
    const months: string[] = [
        "01", "02", "03", "04", "05", "06",
        "07", "08", "09", "10", "11", "12"
    ];

    const currentYear = new Date().getFullYear();
    const years: string[] = Array.from({ length: 12 }, (_, i) => (currentYear + i).toString());
    const { cart } = useSelector((state: RootState) => state.cart);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { up } = useBreakpoint();

    const computeTotalBooks = () => {
        if (!cart) return 0;
        const booksCount = cart.cartLines.reduce((total, line) => total + line.quantity, 0);

        return booksCount;
    }

    const computeStartDate = () => {
        const startDate = new Date();
        return startDate;
    }

    const computeEndDate = () => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        return endDate;
    }

    const handleLoanCreation = async () => {
        try {
            const loanDto = {
                loanDate: computeStartDate().toISOString(),
                dueDate: computeEndDate().toISOString(),
                loanLines: cart?.cartLines.map(line => ({
                    bookId: line.bookId,
                    quantity: line.quantity
                })) || []
            }

            await requests.loan.createLoan(loanDto);

            toast.success("Kiralama işlemi başarıyla tamamlandı.");
            dispatch(clearCart());
            navigate("/");
        }
        catch (error: any) {
            toast.error(error?.response?.data?.message || "Kiralama işlemi sırasında bir hata oluştu.");
            navigate("/Cart");
        }
    }

    return (
        <div className="flex flex-col">
            <p className="font-semibold text-2xl md:text-4xl mx-8 lg:mx-28 text-violet-500 h-fit border-none pb-2 mb-6 md:mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-16 md:after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kiralamayı Tamamla</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-10 lg:gap-x-20 px-8 lg:px-28">
                <div className="flex flex-col">
                    <div className="px-4 py-3 lg:px-8 lg:py-6 bg-violet-500 rounded-tl-lg rounded-tr-lg">
                        <p className="text-white font-bold text-lg lg:text-xl">
                            <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                            Ödeme Bilgileri
                        </p>
                    </div>
                    <div className="flex flex-col gap-y-4 lg:gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 px-6 py-8 lg:px-8 lg:py-10">
                        <div className="flex flex-col">
                            <label className="font-bold text-gray-500 text-base">Kart Üzerindeki İsim</label>
                            <input type="text" placeholder="Ad Soyad" className="input w-full mt-4" />
                        </div>
                        <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-x-10">
                            <div className="flex flex-col gap-y-4 w-full lg:w-1/2">
                                <label className="font-bold text-gray-500 text-base">Kart Numarası</label>
                                <input type="text" placeholder="1234 5678 9123 4567" className="input w-full" />
                            </div>
                            <div className="flex flex-col gap-y-4">
                                <label className="font-bold text-gray-500 text-base">Kartın Son Kullanma Tarihi</label>
                                <div>
                                    <select className="input">
                                        {months.map((month) => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                    <span className="mx-2 font-bold">/</span>
                                    <select className="input">
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row gap-x-10">
                            <div className="flex flex-col gap-y-4 w-1/2">
                                <label className="font-bold text-gray-500 text-base">CVV</label>
                                <input type="text" placeholder="123" className="input w-full" />
                            </div>
                            <div className="flex flex-row gap-x-4 self-end ml-auto mr-auto mb-2">
                                <FontAwesomeIcon icon={faCcMastercard} className="text-red-500 text-4xl hover:scale-110 duration-500" />
                                <FontAwesomeIcon icon={faCcVisa} className="text-blue-600 text-4xl hover:scale-110 duration-500" />
                            </div>
                        </div>
                        <div className="flex flex-row mt-10 gap-x-4">
                            <button onClick={() => handleLoanCreation()} className="button w-1/2 font-bold text-sm lg:text-lg lg:!py-4 hover:scale-105 duration-300">
                                <FontAwesomeIcon icon={faCheck} className="lg:mr-2 mr-1" />
                                {up.lg ? "Kiralamayı Tamamla" : "Tamamla"}
                            </button>
                            <Link to="/cart" className="button w-1/2 !bg-red-500 text-center font-bold !py-4 text-sm lg:text-lg hover:scale-105 duration-300">
                                <FontAwesomeIcon icon={faArrowLeft} className="lg:mr-2 mr-1" />
                                Geri Dön
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col ">
                    <div className="px-4 py-3 lg:px-8 lg:py-6 bg-violet-500 rounded-tl-lg rounded-tr-lg">
                        <p className="text-white font-bold text-lg lg:text-xl">
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                            Kiralama Detayları
                        </p>
                    </div>
                    <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border h-full border-gray-200 px-6 py-8 lg:px-8 lg:py-10">
                        <div className="flex flex-col rounded-xl border-gray border-2 gap-y-2 shadow-lg px-4 py-6">
                            <div className="flex flex-row">
                                <p className="font-semibold text-xs lg:text-base text-gray-600">Toplam kiralama günü:</p>
                                <p className="font-semibold text-xs lg:text-base self-cente text-gray-500 ml-auto"> 30 gün</p>
                            </div>
                            <div className="flex flex-row">
                                <p className="font-semibold text-xs lg:text-base text-gray-600">Kiralanan toplam kitap:</p>
                                <p className="font-semibold text-xs lg:text-base self-cente text-gray-500 ml-auto">{computeTotalBooks().toString()}</p>
                            </div>
                            <div className="flex flex-row">
                                <p className="font-semibold text-xs lg:text-base text-gray-600">İşlem bedeli:</p>
                                <p className="font-semibold text-xs lg:text-base self-cente text-gray-500 ml-auto">{computeTotalBooks() * 30} ₺</p>
                            </div>
                        </div>
                        <div className="flex flex-col rounded-xl border-gray border-2 gap-y-2 shadow-lg px-4 py-6">
                            <div className="flex flex-row">
                                <p className="font-semibold text-xs lg:text-base text-gray-600">Kiralama başlangıç günü:</p>
                                <p className="font-semibold text-xs lg:text-base self-center text-gray-500 ml-auto">{computeStartDate().toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-row">
                                <p className="font-semibold text-xs lg:text-base text-gray-600">Kiralama bitiş günü:</p>
                                <p className="font-semibold text-xs lg:text-base self-cente text-gray-500 ml-auto">{computeEndDate().toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-row">
                                <p className="font-semibold text-xs lg:text-base text-gray-600">Gecikme haftası / ceza:</p>
                                <p className="font-semibold text-xs lg:text-base self-cente text-gray-500 ml-auto">{computeTotalBooks() * 50} ₺</p>
                            </div>
                        </div>
                        <div className="text-xs lg:text-sm text-gray-500 flex flex-col mt-auto ">
                            <p>* Kiralama işlemi için 18 yaşını doldurmuş olmanız gerekmektedir.</p>
                            <p>* Kiralanan kitaplar 7 gün içerisinde iade edilmelidir. Aksi takdirde günlük 10 ₺ gecikme bedeli uygulanır.</p>
                            <p>* Kiralama işlemi sırasında geçerli bir kredi kartı bilgisi gerekmektedir.</p>
                            <p>* Kiralama işlemi tamamlandıktan sonra iptal edilemez ve iade yapılamaz.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}