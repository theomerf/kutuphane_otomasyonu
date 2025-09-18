import { useMemo, useState, useEffect } from "react";
import type BookRequestParameters from "../../types/bookRequestParameters";
import requests from "../../services/api";
import type Book from "../../types/book";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faHeart, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ClipLoader } from "react-spinners";
import type PaginationHeader from "../../types/paginationHeader";
import { useDebounce } from "../../hooks/useDebounce";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { Rating } from "../../components/ui/Rating";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../store/store";
import { addLineToCart, removeLineFromCart } from "../Cart/cartSlice";
import type { CartLine } from "../../types/cartResponse";
import Filters, { type FilterSection } from "../../components/books/Filters";
import BookPagination from "../../components/books/BookPagination";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Books() {
  const [openSections, setOpenSections] = useState<string[]>(["categories", "authors", "other"]);
  const dispatch = useAppDispatch();
  const { cart } = useSelector((state: RootState) => state.cart);
  const isOthersOpen: boolean = openSections.includes("other");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Book[] | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterSection[]>([]);
  const { up } = useBreakpoint();
  const [pagination, setPagination] = useState<PaginationHeader>({
    CurrentPage: 1,
    TotalPage: 0,
    PageSize: 6,
    TotalCount: 0,
    HasPrevious: false,
    HasPage: false
  });
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [query, setQuery] = useState<BookRequestParameters>({
    pageNumber: 1,
    pageSize: 6
  });

  const finalQuery = useMemo(() => ({
    ...query,
    searchTerm: debouncedSearch || undefined
  }), [query, debouncedSearch]);

  const fetchBooks = async (queryParams: BookRequestParameters, signal?: AbortSignal) => {
    try {
      const queryString = new URLSearchParams();

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value.toString());
        }
      });

      const response = await requests.books.getAllBooks(queryString, signal);

      const paginationHeaderStr = response.headers?.["x-pagination"];
      if (paginationHeaderStr) {
        const paginationData: PaginationHeader = JSON.parse(paginationHeaderStr);
        setPagination(paginationData);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      return response.data as Book[];
    }
    catch (error) {
      if ((error as any).name !== "CanceledError" && (error as any).name !== "AbortError") {
        throw error;
      }
      return [];
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const books = await fetchBooks(finalQuery);
        setData(books);
      }
      catch (error: any) {
        if (error.name === "CanceledError" || error.name === "AbortError") {
          console.log("Request cancelled");
        }
        else {
          setError("Kitaplar yüklenirken bir hata oluştu.");
        }
      }
      finally {
        setIsLoading(false);
      }
    };

    loadBooks();

    return () => {
      controller.abort();
    };
  }, [finalQuery]);

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
    <div className="sm:px-1 px-5 lg:px-20 lg:grid lg:grid-cols-4">
      <Filters isFiltersOpen={isFiltersOpen} setIsFiltersOpen={setIsFiltersOpen} filters={filters} setFilters={setFilters} openSections={openSections} setOpenSections={setOpenSections} isOthersOpen={isOthersOpen} searchInput={searchInput} query={query} setQuery={setQuery} setSearchInput={setSearchInput} debouncedSearch={debouncedSearch} up={up} />

      <div className="lg:col-span-3 flex flex-col mt-8 lg:mt-0">
        {(isLoading) && (
          <div className="flex justify-center items-center h-64">
            <ClipLoader size={40} color="#8B5CF6" />
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-64 text-red-500">
            Kitaplar yüklenirken bir hata oluştu.
          </div>
        )}

        {data && !isLoading && (
          <motion.div initial="hidden" animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.15 } }
            }}>
            {data.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-20 px-3 lg:gap-x-10 lg:gap-y-20 lg:px-20">
                {data.map(book => (
                  <Link to={`${book.id}`} key={book.id} className="group lg:hover:scale-110 duration-500">
                  <motion.div variants={{
                    hidden: { y: 30, opacity: 0 },
                    show: { y: 0, opacity: 1 }
                  }}
                    transition={{ duration: 0.6, ease: "easeOut" }} className="flex flex-col  bg-white/90 relative p-3 lg:p-6 border-2 border-white/20 shadow-lg rounded-2xl ">
                    <div className="absolute rotate-[-60deg] top-[-5%] right-[-20%] lg:top-[-5%] lg:left-[-15%] lg:right-[180%] lg:rotate-[30deg] text-center  z-[3] rounded-3xl bg-green-500 px-2 py-[5px] lg:py-[10px] w-fit text-xs lg:text-sm [text-transform:uppercase] mx-auto mt-3 font-semibold [letter-spacing:0.5px] text-white before:content-[''] before:absolute before:right-[-5px] before:top-2  lg:before:left-[-7px] lg:before:top-[25%] lg:before:bottom-0 before:w-3 before:h-3 lg:before:w-[14px] lg:before:h-[14px] before:bg-[radial-gradient(circle,rgba(217,_20,_20,_1)_0%,_rgba(201,_41,_20,_1)_100%)] before:[border-radius:50%]">
                      {(book.availableCopies ?? 0) > 0 ? "Mevcut" : "Tükendi"}
                    </div>
                    <div className="absolute top-4 right-7 flex gap-3 z-[4] opacity-0 translate-x-[20px] scale-[80%] duration-500 group-hover:opacity-100">
                      <button type="button" title="Favorilere Ekle" className="w-11 h-11 rounded-full bg-white flex items-center justify-center border-none shadow-lg text-red-500 transition-all duration-500 cursor-pointer backdrop-blur-lg border-4 border-white/30 hover:scale-110 hover:rotate-[5deg] hover:shadow-xl">
                        <FontAwesomeIcon icon={faHeart} />
                      </button>
                    </div>
                    <div className="h-[150px] lg:h-[260px] overflow-hidden rounded-xl relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-8 after:z-[1] bg-top bg-white/0">
                      <img src={book.Images?.[0].imageUrl?.includes("books") ? (("https://localhost:7214/images/" + book.Images?.[0]?.imageUrl)) : (book.Images?.[0]?.imageUrl!)} className="w-full h-full object-contain hover:scale-110 duration-700" alt="Book Cover" />
                    </div>
                    <div className="flex flex-col text-center content-center justify-center  h-32">
                      <div className="h-20 lg:h-20">
                        <p className="font-bold text-sm lg:text-lg m-0 overflow-hidden line-clamp-2 text-[#1e293b] [text-shadow:_0_1px_2px_rgba(0,_0,_0,_0.05)]">{book.title}</p>
                        <p className="font-medium text-xs lg:text-base m-0 overflow-hidden text-gray-500 [text-shadow:_0_1px_2px_rgba(0,_0,_0,_0.05)]">({book.Authors?.[0].name})</p>
                      </div>
                      <div className="lg:mt-2">
                        <Rating rating={book.averageRating ?? 0} />
                      </div>
                    </div>
                    <div className="flex justify-center gap-3 lg:mt-3">

                      {(cart?.cartLines && cart?.cartLines?.findIndex(l => l.bookId === book.id) !== -1) ? (
                        <button type="button" onClick={(e) => handleRemoveFromCart(e, book.id!)} className="w-full py-[11px] lg:py-[14px] border-none rounded-3xl shadow-red-200 shadow-lg bg-red-600 text-white font-bold text-[9px] lg:text-base items-center justify-center gap-3 duration-[0.4s] [text-transform:uppercase] cursor-pointer relative overflow-hidden hover:scale-110">
                          <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Sepetten Kaldır</span>
                          <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        </button>
                      ) : (
                        <button type="button" onClick={(e) => handleAddToCart(e, book)} className="w-full py-[11px] lg:py-[14px] border-none rounded-3xl shadow-violet-400 shadow-lg bg-hero-gradient text-white font-bold text-[9px] lg:text-base items-center justify-center gap-3 duration-[0.4s] [text-transform:uppercase] cursor-pointer relative overflow-hidden hover:scale-110">
                          <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Sepete Ekle</span>
                          <FontAwesomeIcon icon={faCartPlus} className="mr-1" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-500">
                {debouncedSearch ? `"${debouncedSearch}" araması için sonuç bulunamadı.` : "Kitap bulunamadı."}
              </div>
            )}
          </motion.div>
        )}

        <BookPagination data={data} pagination={pagination} isLoading={isLoading} error={error} up={up} query={query} setQuery={setQuery} />
      </div>
    </div>
  );
}