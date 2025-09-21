import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store/store";
import { clearCart, decreaseQuantity, increaseQuantity, removeLineFromCart } from "./cartSlice";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faChevronDown, faChevronUp, faLock, faMinus, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faCcVisa, faCcMastercard } from "@fortawesome/free-brands-svg-icons";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { ErrorDisplay } from "../../components/ui/ErrorDisplay";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";

export default function Cart() {
    const dispatch: AppDispatch = useDispatch();
    const { cart, status, error } = useSelector((state: RootState) => state.cart);
    const { up } = useBreakpoint();
    const [isMobilLendDetailsOpen, setIsMobilLendDetailsOpen] = useState(false);

    const computeTotalBooks = () => {
        if (!cart) return 0;
        const booksCount = cart.cartLines.reduce((total, line) => total + line.quantity, 0);

        return booksCount;
    }

    return (
        <>
            <div className="flex flex-col">
                <p className="font-semibold text-4xl ml-8 lg:ml-20 text-violet-500 h-fit border-none pb-2 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Sepetim</p>
                <div className="lg:grid lg:grid-cols-6 lg:gap-x-20 px-5 relative lg:px-20">
                    <div className="col-span-4 flex flex-col shadow-2xl rounded-xl h-fit border overflow-hidden border-gray-300">
                        {status === "pending" && (
                            <div className="flex justify-center items-center h-64">
                                <ClipLoader size={40} color="#8B5CF6" />
                            </div>
                        )}
                        <ErrorDisplay error={error!} />
                        {cart && <button type="button" onClick={() => dispatch(clearCart())} title="Sepeti Temizle" className="absolute left-0 text-white bg-violet-500 p-3 rounded-tr-lg rounded-br-lg z-50 hover:bg-violet-600 hover:scale-105 duration-300 shadow-md">
                            <FontAwesomeIcon icon={faTrash} />
                        </button>}
                        {cart && cart.cartLines.length > 0 ? (
                            cart.cartLines?.map((line) => (
                                <div key={line.id} className={`${up.lg ? "hover:bg-gray-100 hover:translate-x-2 hover:before:content-[''] hover:before:top-0 hover:before:absolute hover:before:left-0 hover:before:bottom-0 hover:before:w-1 hover:before:bg-hero-gradient hover:duration-500 duration-500 group" : ""}flex flex-col lg:flex lg:flex-row border-b border-gray-400 py-10 px-8 shadow-lg bg-white`}>
                                    <div className="flex flex-row w-full lg:w-1/2 gap-8">
                                        <img src={line.bookImageUrl?.includes("books") ? (("https://localhost:7214/images/" + line.bookImageUrl)) : (line.bookImageUrl!)} alt={line.bookTitle} className="rounded-lg h-20 border-2 border-gray-300 shadow-lg group-hover:scale-105 group-hover:border-violet-400 group-hover:border-2 duration-500"></img>
                                        <div>
                                            <p className="text-gray-500 text-lg group-hover:text-violet-400 duration-500 font-semibold self-center">{line.bookTitle}</p>
                                            <p className="text-gray-400 text-sm font-semibold self-center">ISBN: {line.bookISBN}</p>
                                            <p className="text-green-600 bg-green-100 border border-green-300 px-2 py-1 my-1 rounded-2xl text-xs font-semibold w-fit self-center">Stokta</p>
                                            <p className="text-gray-400 text-sm font-semibold self-center">Yazar: {line.bookAuthor}</p>
                                        </div>
                                    </div>
                                    {up.lg ? (
                                        <>
                                            <div className="flex flex-row ml-auto shadow-md rounded-3xl border border-violet-100 self-center hover:border-violet-300 duration-300 overflow-hidden hover:shadow-violet-200 hover:shadow-xl">
                                                {line.quantity > 1 && <button type="button" onClick={() => dispatch(decreaseQuantity({ cartLineId: line.id!, quantity: 1 }))} className="flex text-violet-400 rounded-tl-lg rounded-bl-lg py-3 px-2 hover:bg-violet-100 hover:text-black shadow-sm hover:shadow-lg duration-500">
                                                    <FontAwesomeIcon icon={faMinus} className="self-center" />
                                                </button>
                                                }
                                                <p className="text-gray-500 text-base font-bold self-center w-6 text-center">{line.quantity}</p>
                                                <button type="button" disabled={status === "pending"} onClick={() => dispatch(increaseQuantity({ cartLineId: line.id!, quantity: 1 }))} className="flex text-violet-400 rounded-tr-lg rounded-br-lg py-3 px-2 hover:bg-violet-100 hover:text-black hover:shadow-lg duration-500">
                                                    <FontAwesomeIcon icon={faPlus} className="self-center" />
                                                </button>
                                            </div>
                                            <div className="flex ml-auto mr-2">
                                                <button type="button" disabled={status === "pending"} onClick={() => dispatch(removeLineFromCart(line.id!))} className="cartButton text-white p-4 w-5 h-5">
                                                    <FontAwesomeIcon icon={faTrash} className="self-center" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-row mt-5 lg:mt-0">
                                            <div className="flex flex-row ml-auto shadow-md rounded-3xl border border-violet-100 self-center hover:border-violet-300 duration-300 overflow-hidden hover:shadow-violet-200 hover:shadow-xl">
                                                {line.quantity > 1 && <button type="button" onClick={() => dispatch(decreaseQuantity({ cartLineId: line.id!, quantity: 1 }))} className="flex text-violet-400 rounded-tl-lg rounded-bl-lg py-3 px-2 hover:bg-violet-100 hover:text-black shadow-sm hover:shadow-lg duration-500">
                                                    <FontAwesomeIcon icon={faMinus} className="self-center" />
                                                </button>
                                                }
                                                <p className="text-gray-500 text-base font-bold self-center w-6 text-center">{line.quantity}</p>
                                                <button type="button" disabled={status === "pending"} onClick={() => dispatch(increaseQuantity({ cartLineId: line.id!, quantity: 1 }))} className="flex text-violet-400 rounded-tr-lg rounded-br-lg py-3 px-2 hover:bg-violet-100 hover:text-black hover:shadow-lg duration-500">
                                                    <FontAwesomeIcon icon={faPlus} className="self-center" />
                                                </button>
                                            </div>
                                            <div className="flex ml-auto mr-2">
                                                <button type="button" disabled={status === "pending"} onClick={() => dispatch(removeLineFromCart(line.id!))} className="cartButton text-white p-4 w-5 h-5">
                                                    <FontAwesomeIcon icon={faTrash} className="self-center" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ))
                        ) : (
                            <div className="py-10 justify-center content-center flex flex-col text-center">
                                <FontAwesomeIcon icon={faCartShopping} className="text-violet-500 font-bold flex self-center text-5xl animate-pulse"></FontAwesomeIcon>
                                <p className="font-bold flex self-center text-gray-500 text-xl mt-4">Sepetiniz boş.</p>
                                <p className="font-semibold flex self-center text-gray-400 text-base mt-1">Kitaplara göz atabilirsiniz.</p>
                                <Link to="/Books" className="button w-fit self-center font-semibold mt-6 justify-center content-center lg:hover:scale-110 lg:duration-500 lg:transition-all">Kitaplara Git</Link>
                            </div>
                        )}
                    </div>
                    {up.lg ? (
                        <div className="col-span-2 border bg-white border-gray-300 rounded-2xl shadow-lg h-fit">
                            <div className="bg-hero-gradient px-2 py-4 rounded-tl-xl rounded-tr-xl">
                                <p className="text-white text-2xl font-semibold mb-4 text-center">Kiralama Özeti</p>
                            </div>
                            <div className="px-6 py-8 flex flex-col gap-4">
                                <div className="flex flex-row justify-between">
                                    <p className="font-semibold text-gray-600">Toplam kiralama günü:</p>
                                    <p className="font-semibold text-gray-500"> 30 gün</p>
                                </div>
                                <div className="flex flex-row justify-between">
                                    <p className="font-semibold text-gray-600">Kiralanan toplam kitap:</p>
                                    <p className="font-semibold text-gray-500">{computeTotalBooks().toString()}</p>
                                </div>
                                <div className="flex flex-row justify-between">
                                    <p className="font-semibold text-gray-600">İşlem bedeli:</p>
                                    <p className="font-semibold text-gray-500">{computeTotalBooks() * 30} ₺</p>
                                </div>
                                <hr className="mt-5 h-1 bg-violet-600 border-0 rounded animate-pulse" />
                                <div className="mt-5 flex flex-col gap-4">
                                    {cart?.cartLines && cart?.cartLines.length > 0 ? (
                                        <Link to="/Checkout" className="button w-full h-14 font-semibold text-lg text-center hover:scale-105">
                                            Kiralamayı Onayla
                                        </Link>
                                    ) : (
                                        <span className="button w-full h-14 font-semibold text-lg text-center opacity-50 cursor-not-allowed">
                                            Kiralamayı Onayla
                                        </span>
                                    )}
                                </div>
                                <div className="text-green-600 flex flex-row gap-x-2 self-center py-4 border border-green-200 bg-green-50 rounded-lg w-full text-center justify-center">
                                    <FontAwesomeIcon icon={faLock} className="self-center flex" />
                                    <p>Güvenli Ödeme</p>
                                </div>
                                <div className="w-full text-center mt-5 flex flex-col gap-2">
                                    <p className="font-semibold text-gray-500">Ödeme Seçenekleri</p>
                                    <div className="flex flex-row gap-2 justify-center">
                                        <FontAwesomeIcon icon={faCcVisa} className="text-3xl text-blue-500" />
                                        <FontAwesomeIcon icon={faCcMastercard} className="text-3xl text-red-500" />
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p>* Kiralama işlemi için 18 yaşını doldurmuş olmanız gerekmektedir.</p>
                                    <p>* Kiralanan kitaplar 7 gün içerisinde iade edilmelidir. Aksi takdirde günlük 10 ₺ gecikme bedeli uygulanır.</p>
                                    <p>* Kiralama işlemi sırasında geçerli bir kredi kartı bilgisi gerekmektedir.</p>
                                    <p>* Kiralama işlemi tamamlandıktan sonra iptal edilemez ve iade yapılamaz.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="fixed bottom-0 left-0 w-full flex flex-col text-center z-[100] justify-center px-3 py-2 bg-violet-200/90">
                                <div className="flex flex-row">
                                    <button onClick={() => isMobilLendDetailsOpen ? setIsMobilLendDetailsOpen(false) : setIsMobilLendDetailsOpen(true)} className="mr-auto font-semibold">
                                        Kiralama Detayları
                                        <FontAwesomeIcon icon={isMobilLendDetailsOpen ? faChevronDown : faChevronUp} className="ml-1"></FontAwesomeIcon>
                                    </button>
                                    <Link to="/Checkout" className="py-3 text-white rounded-lg bg-violet-500 w-3/6 text-center px-2">Kiralamayı Onayla</Link>
                                </div>

                                {isMobilLendDetailsOpen &&
                                    <div className="col-span-2 border mt-5 bg-white border-gray-300 rounded-2xl shadow-lg h-fit">
                                        <div className="px-6 py-8 flex flex-col gap-4">
                                            <div className="flex flex-row justify-between">
                                                <p className="font-semibold text-gray-600">Toplam kiralama günü:</p>
                                                <p className="font-semibold text-gray-500"> 30 gün</p>
                                            </div>
                                            <div className="flex flex-row justify-between">
                                                <p className="font-semibold text-gray-600">Kiralan toplam kitap:</p>
                                                <p className="font-semibold text-gray-500">{computeTotalBooks().toString()}</p>
                                            </div>
                                            <div className="flex flex-row justify-between">
                                                <p className="font-semibold text-gray-600">İşlem bedeli:</p>
                                                <p className="font-semibold text-gray-500">{computeTotalBooks() * 30} ₺</p>
                                            </div>
                                            <div className="text-green-600 flex flex-row gap-x-2 self-center py-4 border border-green-200 bg-green-50 rounded-lg w-full text-center justify-center">
                                                <FontAwesomeIcon icon={faLock} className="self-center flex" />
                                                <p>Güvenli Ödeme</p>
                                            </div>
                                            <div className="w-full text-center mt-5 flex flex-col gap-2">
                                                <p className="font-semibold text-gray-500">Ödeme Seçenekleri</p>
                                                <div className="flex flex-row gap-2 justify-center">
                                                    <FontAwesomeIcon icon={faCcVisa} className="text-3xl text-blue-500" />
                                                    <FontAwesomeIcon icon={faCcMastercard} className="text-3xl text-red-500" />
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <p>* Kiralama işlemi için 18 yaşını doldurmuş olmanız gerekmektedir.</p>
                                                <p>* Kiralanan kitaplar 7 gün içerisinde iade edilmelidir. Aksi takdirde günlük 10 ₺ gecikme bedeli uygulanır.</p>
                                                <p>* Kiralama işlemi sırasında geçerli bir kredi kartı bilgisi gerekmektedir.</p>
                                                <p>* Kiralama işlemi tamamlandıktan sonra iptal edilemez ve iade yapılamaz.</p>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </>
                    )}


                </div>
            </div>
        </>
    )
}