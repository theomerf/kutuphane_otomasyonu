import { Link } from "react-router-dom";
import type Book from "../../types/book";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCartPlus, faHeart, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { Rating } from "../ui/Rating";
import { useAppDispatch, type AppDispatch, type RootState } from "../../store/store";
import { useSelector } from "react-redux";
import type { CartLine } from "../../types/cartResponse";
import { addLineToCart, removeLineFromCart } from "../../pages/Cart/cartSlice";
import { addToFavorites, removeFromFavorites } from "../../pages/Favorites/favoritesSlice";

type BookCardProps = {
    book: Book;
}

export default function BookCard({ book }: BookCardProps) {
    const dispatch: AppDispatch = useAppDispatch();
    const { cart } = useSelector((state: RootState) => state.cart);
    const { favorites } = useSelector((state: RootState) => state.favorites);

    const handleAddToCart = (e: React.MouseEvent, book: Book) => {
        e.preventDefault();
        e.stopPropagation();
        const newLine: CartLine = {
            bookId: book.id!,
            cartId: cart ? cart.id! : 0,
            quantity: 1,
        }

        dispatch(addLineToCart(newLine));
    }

    const handleRemoveFromCart = (e: React.MouseEvent, bookId: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!cart) return;
        const line = cart.cartLines?.find(line => line.bookId === bookId);
        if (!line) return;
        dispatch(removeLineFromCart(line.id!));
    }


    return (
        <Link to={`/books/${book.id}`} key={book.id} className="group lg:hover:scale-110 duration-500">
            <motion.div variants={{
                hidden: { y: 30, opacity: 0 },
                show: { y: 0, opacity: 1 }
            }}
                transition={{ duration: 0.6, ease: "easeOut" }} className="flex flex-col  bg-white/90 relative p-3 lg:p-6 border-2 border-white/20 shadow-lg rounded-2xl ">
                <div className={`${(book.availableCopies ?? 0) > 0 ? "bg-green-500" : "bg-red-500"} absolute rotate-[-60deg] top-[-5%] right-[-20%] lg:top-[-5%] lg:left-[-15%] lg:right-[180%] lg:rotate-[30deg] text-center  z-[3] rounded-3xl  px-2 py-[5px] lg:py-[10px] w-fit text-xs lg:text-sm [text-transform:uppercase] mx-auto mt-3 font-semibold [letter-spacing:0.5px] text-white before:content-[''] before:absolute before:right-[-5px] before:top-2  lg:before:left-[-7px] lg:before:top-[25%] lg:before:bottom-0 before:w-3 before:h-3 lg:before:w-[14px] lg:before:h-[14px] before:bg-[radial-gradient(circle,rgba(217,_20,_20,_1)_0%,_rgba(201,_41,_20,_1)_100%)] before:[border-radius:50%]`}>
                    {(book.availableCopies ?? 0) > 0 ? "Mevcut" : "Tükendi"}
                </div>
                <div className="absolute top-4 right-0 flex z-50 opacity-0 group-hover:translate-x-[-15px] scale-[80%] group-hover:scale-100 duration-500 group-hover:opacity-100">
                    {favorites && favorites.includes(book.id!) ? (

                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); dispatch(removeFromFavorites(book.id!)) }} title="Favorilerden Kaldır" className="w-9 h-9 rounded-full bg-white flex items-center justify-center border-none shadow-lg text-red-500 transition-all duration-500 cursor-pointer backdrop-blur-lg border-4 border-white/30 hover:scale-110 hover:shadow-xl">
                            <FontAwesomeIcon icon={faHeart} />
                        </button>
                    ) : (
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); dispatch(addToFavorites(book.id!)) }} title="Favorilere Ekle" className="w-9 h-9 text-lg rounded-full bg-white flex items-center justify-center border-none shadow-lg text-red-500 transition-all duration-500 cursor-pointer backdrop-blur-lg border-4 border-white/30 hover:scale-110 hover:shadow-xl">
                            <FontAwesomeIcon icon={farHeart} />
                        </button>
                    )}
                </div>
                <div className="h-[150px] lg:h-[260px] overflow-hidden rounded-xl relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-8 after:z-[1] bg-top bg-white/0">
                    <img src={book.images?.[0].imageUrl?.includes("books") ? (("https://localhost:7214/images/" + book.images?.[0]?.imageUrl)) : (book.images?.[0]?.imageUrl!)} className="w-full h-full object-contain hover:scale-110 duration-700" alt="Book Cover" />
                </div>
                <div className="flex flex-col text-center content-center justify-center  h-32">
                    <div className="h-20 lg:h-20">
                        <p className="font-bold text-sm lg:text-lg m-0  overflow-hidden line-clamp-2 text-[#1e293b] [text-shadow:_0_1px_2px_rgba(0,_0,_0,_0.05)]">{book.title}</p>
                        <p className="font-medium text-xs lg:text-base m-0 overflow-hidden text-gray-500 [text-shadow:_0_1px_2px_rgba(0,_0,_0,_0.05)]">({book.authors?.[0].name})</p>
                    </div>
                    <div className="lg:mt-2">
                        <Rating rating={book.averageRating ?? 0} />
                    </div>
                </div>
                <div className="flex justify-center gap-3 lg:mt-3">

                    {(book.availableCopies ?? 0) < 1 ? (
                        <button type="button" disabled className="w-full py-[11px] lg:py-[14px] border-none rounded-3xl shadow-gray-400 shadow-lg bg-gray-400 text-white font-bold text-[9px] lg:text-base items-center justify-center gap-3 duration-[0.4s] [text-transform:uppercase] cursor-not-allowed relative overflow-hidden">
                            <FontAwesomeIcon icon={faBan} className="mr-2" />
                            <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Stokta Yok</span>
                        </button>
                    ) : ((cart?.cartLines && cart?.cartLines?.findIndex(l => l.bookId === book.id) !== -1) ? (
                        <button type="button" onClick={(e) => handleRemoveFromCart(e, book.id!)} className="w-full py-[11px] lg:py-[14px] border-none rounded-3xl shadow-red-200 shadow-lg bg-red-600 text-white font-bold text-[9px] lg:text-base items-center justify-center gap-3 duration-[0.4s] [text-transform:uppercase] cursor-pointer relative overflow-hidden hover:scale-110">
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Sepetten Kaldır</span>
                        </button>
                    ) : (
                        <button type="button" disabled={(book.availableCopies ?? 0) < 1} onClick={(e) => handleAddToCart(e, book)} className="w-full py-[11px] lg:py-[14px] border-none rounded-3xl shadow-violet-400 shadow-lg bg-hero-gradient text-white font-bold text-[9px] lg:text-base items-center justify-center gap-3 duration-[0.4s] [text-transform:uppercase] cursor-pointer relative overflow-hidden hover:scale-110">
                            <FontAwesomeIcon icon={faCartPlus} className="mr-2" />
                            <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Sepete Ekle</span>
                        </button>
                    ))}
                </div>
            </motion.div>
        </Link>
    );
}