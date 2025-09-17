import { useCallback, useMemo, useState, useEffect } from "react";
import type BookRequestParameters from "../../types/bookRequestParameters";
import requests from "../../services/api";
import type Book from "../../types/book";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faChevronDown, faChevronUp, faFilter, faFilterCircleXmark, faFire, faHeart, faLayerGroup, faList, faSearch, faSliders, faStar, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ClipLoader } from "react-spinners";
import { Switch } from "../../components/ui/Switch";
import type PaginationHeader from "../../types/paginationHeader";
import { Pagination } from "../../components/ui/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { Rating } from "../../components/ui/Rating";
import type Category from "../../types/category";
import type Author from "../../types/author";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../store/store";
import { addLineToCart, removeLineFromCart } from "../Cart/cartSlice";
import type { CartLine } from "../../types/cartResponse";

interface FilterSection {
  id: string;
  title: string;
  items: { id: number | null; name: string | null; bookCount?: number | null }[];
}

export default function Books() {
  const [openSections, setOpenSections] = useState<string[]>(["categories", "authors", "other"]);
  const dispatch = useAppDispatch();
  const { cart } = useSelector((state: RootState) => state.cart);
  const isOthersOpen: boolean = openSections.includes("other");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Book[] | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [ filters, setFilters ] = useState<FilterSection[]>([]);
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

  useEffect(() => {
    setQuery({
      pageNumber: 1,
      pageSize: 6
    });
    setPagination({
      CurrentPage: 1,
      PageSize: 6,
    });
  }, []);

  const fetchCategories = async () => {
    const response = await requests.categories.getPopularCategories();
    return response.data as Category[];
  }

  const fetchAuthors = async () => {
    const response = await requests.authors.getPopularAuthors();
    return response.data as Author[];
  }

  useEffect(() => {
    const loadFilters = async () => {
      const categories = await fetchCategories();
      const authors = await fetchAuthors();

      setFilters([
        {
          id: "categories",
          title: "Kategoriler",
          items: categories.map(c => ({ id: c.id, name: c.name, bookCount: c.bookCount }))
        },
        {
          id: "authors",
          title: "Yazarlar",
          items: authors.map(a => ({ id: a.id, name: a.name, bookCount: a.bookCount }) )
        }
      ])
    };

    loadFilters();
  }, []);

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

  const handleAddToCart = (book: Book) => {
    const newLine: CartLine = {
      bookId: book.id!,
      cartId: cart ? cart.id! : 0,
      quantity: 1,
    }
    
    dispatch(addLineToCart(newLine));
  }

  const handleRemoveFromCart = (bookId: number) => {
    if (!cart) return;
    const line = cart.cartLines?.find(line => line.bookId === bookId);
    if (!line) return;
    dispatch(removeLineFromCart(line.id!));
  }

  const handlePageChange = (newPage: number) => {
    setQuery(prev => ({
      ...prev,
      pageNumber: newPage
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setQuery(prev => ({
      ...prev,
      pageSize: newSize,
      pageNumber: 1
    }));
  };

  useEffect(() => {
    setQuery(prev => ({
      ...prev,
      pageNumber: 1
    }));
  }, [debouncedSearch])

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => sectionId !== id)
        : [...prev, sectionId]
    );
  };

  const shouldShowPagination = pagination.TotalPage! > 1 && !isLoading && !error;

  return (
    <div className="sm:px-1 px-5 lg:px-20 lg:grid lg:grid-cols-4">
      <div className="flex flex-col fixed lg:static left-0 top-20 z-10 lg:col-span-1 overflow-y-auto w-5/6 h-fit  bg-white/95 lg:bg-white/90 shadow-lg rounded-tr-xl rounded-br-xl lg:rounded-xl">
        {(up.lg || isFiltersOpen) ? (
          <>
            <div className="bg-violet-400 relative px-4 rounded-tr-xl lg:rounded-xl lg:rounded-b-none py-4">
              <p className="font-bold text-lg mb-3 text-center text-white/95 [text-shadow:_0_1px_2px_rgba(0,_0,_0,_0.05)]">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Kitap Filtreleri
              </p>
              {!up.lg && <button onClick={() => setIsFiltersOpen(false)} className="bg-red-600 rounded-full w-8 h-8 absolute right-3 top-3 text-white py-1 px-2">X</button>}
            </div>
            <div className="max-h-[80vh] lg:max-h-[140vh] overflow-y-auto">
            {filters.map((section) => {
              const isOpen = openSections.includes(section.id);

              return (
                <div key={section.id} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`${isOpen ? "bg-violet-100 border-b-[1px]" : "border-b-none"} w-full flex items-center border-violet-300 justify-between py-4 px-4 text-left rounded transition-colors`}
                  >
                    <span className={`${isOpen ? "text-violet-600 font-bold" : "text-black font-medium"}`}>
                      <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-violet-600" />
                      {section.title}
                    </span>
                    {((section.id === "categories" && query.categoryId) || (section.id === "authors" && query.authorId)) && 
                      <button onClick={(e) => {
                            e.stopPropagation();
                            if (section.id === "categories") {
                              setQuery(prev => ({
                                ...prev,
                                categoryId: undefined,
                                pageNumber: 1
                              }));
                            }
                            else if (section.id === "authors") {
                              setQuery(prev => ({
                                ...prev,
                                authorId: undefined,
                                pageNumber: 1
                              }));
                            }
                          }} title="Filtreyi Temizle" className="bg-red-600 rounded-full w-8 h-8 ml-auto mr-2 hover:scale-110 duration-300 text-white">
                        <FontAwesomeIcon icon={faFilterCircleXmark}></FontAwesomeIcon>
                      </button>}
                    <FontAwesomeIcon
                      icon={isOpen ? faChevronUp : faChevronDown}
                      className={`text-gray-400 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 gap-2 p-4">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if(((section.id === "categories" && query.categoryId === item.id) || (section.id === "authors" && query.authorId === item.id))) {
                              return;
                            }
                            if (section.id === "categories") {
                              setQuery(prev => ({
                                ...prev,
                                categoryId: item.id || undefined,
                                pageNumber: 1
                              }));
                            }
                            else if (section.id === "authors") {
                              setQuery(prev => ({
                                ...prev,
                                authorId: item.id || undefined,
                                pageNumber: 1
                              }));
                            }
                          }}
                          className={`${((section.id === "categories" && query.categoryId === item.id) || (section.id === "authors" && query.authorId === item.id)) ? "bg-violet-600 text-white": ""} flex flex-col relative items-center justify-center p-2 border-[1px] border-gray-100 shadow-sm rounded-lg hover:scale-[110%] overflow-hidden group hover:shadow-lg duration-500 transition-all before:absolute before:content-[''] before:top-0 before:left-1/2 before:right-1/2 before:bg-violet-500 before:h-1 before:transition-all hover:border-gray-300 before:duration-500 before:ease-out hover:before:left-0 hover:before:right-0`}
                        >
                          <FontAwesomeIcon icon={faLayerGroup} className="bg-gray-100 rounded-lg p-4 text-violet-600 group-hover:scale-105 group-hover:bg-violet-400 group-hover:text-white duration-500 font-bold text-lg" />
                          <span className="mt-1 text-base font-semibold h-12">{item.name}</span>
                          <p className={`${((section.id === "categories" && query.categoryId === item.id) || (section.id === "authors" && query.authorId === item.id)) ? "text-white": ""} font-semibold text-gray-500`}>({item.bookCount})</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            <div>
              <button
                onClick={() => toggleSection("other")}
                className={`${isOthersOpen ? "bg-violet-100 border-b-[1px]" : "border-b-none"} w-full flex items-center border-violet-300 justify-between py-4 px-4 text-left rounded transition-colors`}
              >
                <span className={`${isOthersOpen ? "text-violet-600 font-bold" : "text-black font-medium"}`}>
                  <FontAwesomeIcon icon={faSliders} className="mr-2 text-violet-600" />
                  Diğer Filtreler
                </span>
                <FontAwesomeIcon
                  icon={isOthersOpen ? faChevronUp : faChevronDown}
                  className={`text-gray-400 text-sm transition-transform duration-200 ${isOthersOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOthersOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 py-3 mb-3">
                  <div className="flex flex-col content-center justify-center">
                    <p className="my-3 font-semibold">
                      <FontAwesomeIcon icon={faSearch} className="mr-1 text-violet-600" />
                      Kitap ara
                    </p>
                    <div className="flex flex-col content-center justify-center relative">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={handleSearchInputChange}
                      className="border-2 border-[#e5e7eb] rounded-2xl px-4 py-3 text-base transform transition-all duration-300 bg-white/90 focus:outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14, 165, 233, 0.1)] focus:scale-[102%] focus:bg-white/100"
                      placeholder="Ad, kategori, etiket ara..."
                    />
                    {searchInput && <button onClick={() => setSearchInput("")} className="bg-red-600 right-2 rounded-full w-6 h-6 absolute text-white hover:scale-105 duration-300">X</button>}
                    </div>
                  </div>

                  <div className="flex flex-col content-center justify-center">
                    <p className="my-3 font-semibold">
                      <FontAwesomeIcon icon={faStar} className="mr-1 text-violet-600" />
                      Özel Filtreler
                    </p>
                    <div className="border-2 flex items-center flex-row rounded-xl p-4 bg-gray-50">
                      <FontAwesomeIcon icon={faFire} className="text-orange-400 mr-2 self-center" />
                      <div className="mr-2">
                        <p className="font-semibold text-[15px]">En Çok Kiralananlar</p>
                        <p className="text-sm text-gray-500">Popüler Kitaplar</p>
                      </div>
                      <div className="ml-auto">
                        <Switch size="sm" onChange={() => {
                          setQuery(prev => ({
                            ...prev,
                            isPopular: prev.isPopular ? undefined : true,
                          }))
                        }}/>
                      </div>
                    </div>
                    <div className="border-2 flex items-center flex-row rounded-xl p-4 mt-5 bg-gray-50">
                      <FontAwesomeIcon icon={faFire} className="text-orange-400 mr-2 self-center" />
                      <div className="mr-2">
                        <p className="font-semibold text-[15px]">Mevcut kitaplar</p>
                        <p className="text-sm text-gray-500">Sadece mevcut kitaplar</p>
                      </div>
                      <div className="ml-auto">
                        <Switch size="sm" onChange={() => {
                          setQuery(prev => ({
                            ...prev,
                            isAvailable: prev.isAvailable ? undefined : true,
                          }))
                        }}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </>
        ) :
          (<>
            <button onClick={() => setIsFiltersOpen(true)} className="fixed left-0 z-10 top-[10%] p-2 rounded-tr-xl flex flex-col rounded-br-xl bg-violet-500 text-white text-lg font-bold">
              <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
            </button>
          </>
          )}

      </div>

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
          <>
            {data.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-20 px-3 lg:gap-x-10 lg:gap-y-20 lg:px-20">
                {data.map(book => (
                  <div key={book.id} className="flex flex-col group bg-white/90 relative p-3 lg:p-6 border-2 border-white/20 shadow-lg rounded-2xl lg:hover:scale-110 duration-500">
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

                        {(cart?.cartLines && cart?.cartLines?.findIndex(l => l.bookId === book.id) !== -1 ) ? (
                          <button type="button" onClick={() => handleRemoveFromCart(book.id!)} className="w-full py-[11px] lg:py-[14px] border-none rounded-3xl shadow-red-200 shadow-lg bg-red-600 text-white font-bold text-[9px] lg:text-base items-center justify-center gap-3 duration-[0.4s] [text-transform:uppercase] cursor-pointer relative overflow-hidden hover:scale-110">
                            <span  className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Sepetten Kaldır</span>
                          <FontAwesomeIcon icon={faTrash} className="mr-1" />
                          </button>
                        ): (
                          <button type="button" onClick={() => handleAddToCart(book)}className="w-full py-[11px] lg:py-[14px] border-none rounded-3xl shadow-violet-400 shadow-lg bg-hero-gradient text-white font-bold text-[9px] lg:text-base items-center justify-center gap-3 duration-[0.4s] [text-transform:uppercase] cursor-pointer relative overflow-hidden hover:scale-110">
                            <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Sepete Ekle</span>
                          <FontAwesomeIcon icon={faCartPlus} className="mr-1" />
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-500">
                {debouncedSearch ? `"${debouncedSearch}" araması için sonuç bulunamadı.` : "Kitap bulunamadı."}
              </div>
            )}
          </>
        )}

        {data && data.length > 0 && (
          <div className="flex flex-col lg:flex-row lg:gap-x-20 gap-y-5 items-center lg:justify-center mt-10">
            {shouldShowPagination && (
              <div className="border-2 border-white/90 flex gap-x-5 w-fit bg-white shadow-lg rounded-xl">
                <Pagination
                  currentPage={pagination.CurrentPage!}
                  totalPages={pagination.TotalPage!}
                  onPageChange={handlePageChange}
                  maxVisible={up.lg ? 3 : 2}
                  showFirstLast={true}
                  showPrevNext={true}
                />
              </div>
            )}

            <div className="border-2 border-white/90 flex w-fit bg-white gap-x-5 shadow-lg px-2 py-3 rounded-xl">
              <p className="font-semibold self-center">
                <FontAwesomeIcon icon={faList} className="mr-2" />
                Sayfa Başına
              </p>
              <select
                className="ml-auto bg-gray-50 border-2 border-gray-100 rounded-lg px-4"
                value={query.pageSize || 6}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              >
                <option value="6">6</option>
                <option value="12">12</option>
                <option value="24">24</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}