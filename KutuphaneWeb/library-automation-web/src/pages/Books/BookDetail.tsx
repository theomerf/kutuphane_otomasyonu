import { useEffect, useReducer, useState } from "react";
import type Book from "../../types/book";
import requests from "../../services/api";
import { Rating } from "../../components/ui/Rating";
import ImageSwiper from "../../components/ui/ImageSwiper";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBan, faBarcode, faCartPlus, faCircleDot, faLayerGroup, faLocationDot, faPen, faTag, faTags, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, type RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { addLineToCart, removeLineFromCart } from "../Cart/cartSlice";
import type { CartLine } from "../../types/cartResponse";
import type BookRequestParameters from "../../types/bookRequestParameters";
import BookCard from "../../components/books/BookCard";
import UserReviews from "../../components/books/UserReviews";
import BackendDataObjectReducer from "../../types/backendDataObject";
import BackendDataListReducer from "../../types/backendDataList";

export function BookDetail() {
    const [bookDetail, bookDetailDispatch] = useReducer(BackendDataObjectReducer<Book>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [relatedBooks, relatedBooksDispatch] = useReducer(BackendDataListReducer<Book>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [reviewsCount, setReviewsCount] = useState<number>(0);
    const [activePanel, setActivePanel] = useState<'details' | 'reviews'>('details');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { cart } = useSelector((state: RootState) => state.cart);
    const [relatedBookParams, setRelatedBookParams] = useState<BookRequestParameters | null>(null);

    const fetchBooks = async (id: string, signal?: AbortSignal) => {
        bookDetailDispatch({ type: 'FETCH_START' });
        try {
            const response = await requests.books.getOneBook(id, signal);
            bookDetailDispatch({ type: 'FETCH_SUCCESS', payload: response.data as Book });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                bookDetailDispatch({ type: 'FETCH_ERROR', payload: error.message || 'Kitap detayları çekilirken hata oluştu.' });
            }
        }
    };

    const fetchRelatedBooks = async (signal?: AbortSignal) => {
        relatedBooksDispatch({ type: 'FETCH_START' });
        try {
            const queryString = new URLSearchParams();

            Object.entries(relatedBookParams!).forEach(([key, value]) => {
                if (key != "tagIds" && key!="categoryIds" && value !== undefined && value !== null && value !== '') {
                    queryString.append(key, value.toString());
                }
            });

            relatedBookParams!.tagIds?.forEach(tagId => {
                queryString.append('categoryIds', tagId.toString());
            });

            relatedBookParams!.categoryIds?.forEach(tagId => {
                queryString.append('tagIds', tagId.toString());
            });

            const response = await requests.books.getRelatedBooks(bookDetail.data?.id!, queryString, signal);
            relatedBooksDispatch({ type: 'FETCH_SUCCESS', payload: response.data as Book[] });
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                bookDetailDispatch({ type: 'FETCH_ERROR', payload: error.message || 'Benzer kitaplar çekilirken hata oluştu' });
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const id: string = window.location.pathname.split('/').pop() || '';
        fetchBooks(id, controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        fetchUserReviewsCount(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    useEffect(() => {
        if (bookDetail.data && bookDetail.data.tags && bookDetail.data.tags.length > 0) {
            setRelatedBookParams({
                pageNumber: 1,
                pageSize: 4,
                tagIds: bookDetail.data.tags.map(tag => tag.id!),
                categoryIds: bookDetail.data.categories?.map(cat => cat.id!)
            });
        }
    }, [bookDetail.data && !bookDetail.isLoading]);

    useEffect(() => {
        if (relatedBookParams?.tagIds && relatedBookParams.tagIds.length > 0) {
            fetchRelatedBooks();
        }
    }, [relatedBookParams]);

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

    const fetchUserReviewsCount = async (signal?: AbortSignal) => {
        try {
            const id: string = window.location.pathname.split('/').pop() || '';
            const response = await requests.userReview.getUserReviewsCountByBookId(parseInt(id), signal);
            setReviewsCount(response.data as number);
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                bookDetailDispatch({ type: 'FETCH_ERROR', payload: error.message || 'Değerlendirme sayısı çekilirken hata oluştu.' });
            }
        }
    };

    return (
        <>
            {(bookDetail.isLoading) && (
                <div className="flex justify-center items-center h-64">
                    <ClipLoader size={40} color="#8B5CF6" />
                </div>
            )}

            {bookDetail.error && (
                <div className="flex justify-center items-center h-64 text-red-500">
                    {bookDetail.error}
                </div>
            )}
            {bookDetail.data && !bookDetail.isLoading &&
                <div className="flex flex-col gap-y-20 px-5 lg:px-20">
                    <div className="grid grid-cols-5 gap-x-40">
                        <div className="col-span-2">
                            <ImageSwiper images={bookDetail.data?.images || []} />
                        </div>
                        <div className="col-span-3 flex flex-col gap-y-6">
                            <p className="text-violet-500 font-bold text-5xl">{bookDetail.data?.title}</p>
                            <div className="flex flex-row gap-x-10">
                                <div className="flex flex-row gap-x-2">
                                    <FontAwesomeIcon icon={faPen} className="text-gray-500 font-semibold text-xl self-center" />
                                    {bookDetail.data?.authors?.map((author) => (
                                        <p key={author.id} className="text-gray-500 font-semibold text-base">{author.name}</p>
                                    ))}
                                </div>
                                <div className="flex flex-row gap-x-2">
                                    <FontAwesomeIcon icon={faBarcode} className="text-gray-500 font-semibold text-xl self-center" />
                                    <p className="text-gray-500 font-semibold text-base self-center">{bookDetail.data.isbn}</p>
                                </div>
                                <div className="flex flex-row gap-x-2">
                                    <FontAwesomeIcon icon={faLocationDot} className="text-gray-500 font-semibold text-xl self-center" />
                                    <p className="text-gray-500 font-semibold text-base self-center">{bookDetail.data.location}</p>
                                </div>
                            </div>
                            <div className="mt-3 gap-x-3 flex flex-row">
                                <div className="self-center flex"><Rating rating={bookDetail.data?.averageRating || 0} /></div>
                                <p className="self-center text-gray-500 font-bold">({reviewsCount} değerlendirme)</p>
                            </div>
                            <div className="rounded-3xl px-4 py-8 shadow-xl border border-gray-200 bg-gray-50 grid grid-cols-2 gap-x-2 w-4/5">
                                <div className="flex flex-col gap-y-2">
                                    <p className="text-gray-500 font-bold text-xl mb-4">
                                        <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-violet-500" />
                                        Kategoriler
                                    </p>
                                    {bookDetail.data?.categories?.map((category) => (
                                        <span key={category.id} className="text-md font-medium text-gray-500 px-2 bg-violet-50 shadow-sm w-4/5 rounded-lg py-1 hover:scale-105 duration-500">
                                            <FontAwesomeIcon icon={faCircleDot} className="text-violet-500 mr-2" />
                                            {category.name}
                                        </span>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex flex-col gap-y-2">
                                        <p className="text-gray-500 font-bold text-xl mb-4">
                                            <FontAwesomeIcon icon={faTags} className="mr-2 text-violet-500" />
                                            Etiketler
                                        </p>
                                        {bookDetail.data?.tags?.map((tag) => (
                                            <span key={tag.id} className="text-md font-medium px-2 text-gray-500 bg-violet-50 shadow-sm w-4/5 rounded-lg py-1 hover:scale-105 duration-500">
                                                <FontAwesomeIcon icon={faTag} className="text-violet-500 mr-2" />
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-4 mt-16">
                                {(bookDetail.data.availableCopies ?? 0) < 1 ? (
                                    <button type="button" disabled className="button w-1/2 text-2xl font-semibold !bg-gray-400 cursor-not-allowed">
                                        <FontAwesomeIcon icon={faBan} className="mr-2" />
                                        <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Stokta Yok</span>
                                    </button>
                                ) : ((cart?.cartLines && cart?.cartLines?.findIndex(l => l.bookId === bookDetail.data?.id) !== -1) ? (
                                    <button type="button" onClick={(e) => handleRemoveFromCart(e, bookDetail.data?.id!)} className="button w-1/2 hover:scale-105 text-2xl font-semibold !bg-red-600">
                                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                        <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Sepetten Kaldır</span>
                                    </button>
                                ) : (
                                    <button type="button" onClick={(e) => handleAddToCart(e, bookDetail.data!)} className="button w-1/2 hover:scale-105 text-2xl font-semibold">
                                        <FontAwesomeIcon icon={faCartPlus} className="mr-2" />
                                        <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Sepete Ekle</span>
                                    </button>
                                ))}
                                <button type="button" onClick={() => navigate(-1)} className="button w-1/2 !bg-yellow-400 hover:scale-105 text-center text-2xl font-semibold">
                                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                    Kitaplara Dön
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="font-bold text-4xl text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Kitap Özellikleri Ve Değerlendirmeler</p>
                        <div className="shadow-xl border self-center w-4/5 border-gray-200 bg-gray-50">
                            <div className="bg-violet-400 rounded-lg grid grid-cols-2 ">
                                <button onClick={() => setActivePanel('details')} className={`${activePanel == "details" ? "bg-violet-500" : "bg-violet-400"} p-4 text-white font-semibold duration-300 rounded-tl-lg rounded-bl-lg rounded-r-none hover:text-xl hover:bg-violet-500 text-lg`} >
                                    Detaylar
                                </button>
                                <button onClick={() => setActivePanel('reviews')} className={`${activePanel == "reviews" ? "bg-violet-500" : "bg-violet-400"} p-4 text-white border-l-2 duration-300 rounded-tr-lg rounded-br-lg rounded-l-none hover:bg-violet-500 font-semibold text-lg`}>
                                    Değerlendirmeler
                                </button>
                            </div>
                            {activePanel === 'details' &&
                                <div className="text-gray-500 font-medium text-base px-8 py-10 whitespace-pre-line">
                                    {bookDetail.data?.summary}
                                </div>
                            }
                            {activePanel === 'reviews' &&
                                <div className="text-gray-500 font-medium text-base px-8 py-10 whitespace-pre-line">
                                    <UserReviews bookId={bookDetail.data.id!} />
                                </div>
                            }

                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-4xl text-violet-500 h-fit border-none pb-2 mb-12 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-20 after:h-1 after:bg-hero-gradient after:rounded-sm">Benzer Kitaplar</p>
                        {(relatedBooks.isLoading) && (
                            <div className="flex justify-center items-center h-64">
                                <ClipLoader size={40} color="#8B5CF6" />
                            </div>
                        )}

                        {relatedBooks.error && (
                            <div className="flex justify-center items-center h-64 text-red-500">
                                {relatedBooks.error}
                            </div>
                        )}

                        {relatedBooks.data && !relatedBooks.isLoading &&
                            <div className="grid grid-cols-4 px-10 gap-x-12">
                                {relatedBooks.data.map((book) => (
                                    <BookCard key={book.id} book={book} />
                                ))}
                            </div>
                        }
                    </div>
                </div>}
        </>
    )
}