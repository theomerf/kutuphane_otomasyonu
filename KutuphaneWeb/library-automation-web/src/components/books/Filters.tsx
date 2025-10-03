import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faFilter, faFilterCircleXmark, faFire, faLayerGroup, faSearch, faSliders, faStar } from "@fortawesome/free-solid-svg-icons";
import type BookRequestParameters from "../../types/bookRequestParameters";
import { Switch } from "../ui/Switch";
import { useCallback, useEffect } from "react";
import type Category from "../../types/category";
import type Author from "../../types/author";
import requests from "../../services/api";

type FiltersProps = {
    isFiltersOpen: boolean;
    setIsFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenSections: React.Dispatch<React.SetStateAction<string[]>>
    filters: FilterSection[];
    setFilters: React.Dispatch<React.SetStateAction<FilterSection[]>>;
    openSections: string[];
    isOthersOpen: boolean;
    searchInput: string;
    query: BookRequestParameters;
    setQuery: React.Dispatch<React.SetStateAction<BookRequestParameters>>;
    setSearchInput: React.Dispatch<React.SetStateAction<string>>;
    up: Record<"lg" | "sm" | "md" | "xl" | "2xl", boolean>;
    debouncedSearch: string;
}

export type FilterSection = {
    id: string;
    title: string;
    items: { id: number | null; name: string | null; bookCount?: number | null }[];
}

export default function Filters({ isFiltersOpen, setIsFiltersOpen, setOpenSections, filters, openSections, query, setQuery, isOthersOpen, searchInput, setSearchInput, up, debouncedSearch, setFilters }: FiltersProps) {
    const fetchCategories = async (signal: AbortSignal) => {
        try {
            const response = await requests.categories.getPopularCategories(signal);
            return response.data as Category[];
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return [];
            }
            else {
                console.error("Kategoriler yüklenirken hata oluştu:", error);
                return [];
            }
        }

    }

    const fetchAuthors = async (signal: AbortSignal) => {
        try {
            const response = await requests.authors.getPopularAuthors(signal);
            return response.data as Author[];
        }
        catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return [];
            }
            else {
                console.error("Yazarlar yüklenirken hata oluştu:", error);
                return [];
            }
        }
    }

    useEffect(() => {
        const controller = new AbortController();

        const loadFilters = async () => {
            const categories = await fetchCategories(controller.signal);
            const authors = await fetchAuthors(controller.signal);

            setFilters([
                {
                    id: "categories",
                    title: "Kategoriler",
                    items: categories.map(c => ({ id: c.id, name: c.name, bookCount: c.bookCount }))
                },
                {
                    id: "authors",
                    title: "Yazarlar",
                    items: authors.map(a => ({ id: a.id, name: a.name, bookCount: a.bookCount }))
                }
            ])
        };

        loadFilters();

        return () => {
            controller.abort();
        };
    }, []);

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

    const clearAllFilters = () => {
        setQuery({
            pageNumber: 1,
            pageSize: 6
        });
        setSearchInput("");
    }

    return (
        <div className="flex flex-col fixed lg:static left-0 top-20 z-10 lg:col-span-1 overflow-y-auto w-5/6 h-fit  bg-white/95 lg:bg-white/90 shadow-lg rounded-tr-xl rounded-br-xl lg:rounded-xl">
            {(up.lg || isFiltersOpen) ? (
                <>
                    <div className="bg-violet-400 relative px-4 rounded-tr-xl lg:rounded-xl lg:rounded-b-none py-4">
                        <p className="font-bold text-lg mb-3 text-center text-white/95 [text-shadow:_0_1px_2px_rgba(0,_0,_0,_0.05)]">
                            <FontAwesomeIcon icon={faFilter} className="mr-2" />
                            Kitap Filtreleri
                        </p>
                        {query.categoryId || query.authorId || query.isAvailable || query.isPopular || searchInput ? (
                            <button onClick={clearAllFilters} title="Tüm Filtreleri Temizle" className="bg-red-600 rounded-full w-8 h-8 absolute left-4 top-4 hover:scale-110 duration-300 text-white">
                                <FontAwesomeIcon icon={faFilterCircleXmark}></FontAwesomeIcon>
                            </button>
                        ) : null}
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
                                            icon={faChevronDown}
                                            className={`text-gray-400 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="grid grid-cols-2 gap-2 p-4">
                                            {section.items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        if (((section.id === "categories" && query.categoryId === item.id) || (section.id === "authors" && query.authorId === item.id))) {
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
                                                    className={`${((section.id === "categories" && query.categoryId === item.id) || (section.id === "authors" && query.authorId === item.id)) ? "bg-violet-600 text-white" : ""} flex flex-col relative items-center justify-center p-2 border-[1px] border-gray-100 shadow-sm rounded-lg hover:scale-[110%] overflow-hidden group hover:shadow-lg duration-500 transition-all before:absolute before:content-[''] before:top-0 before:left-1/2 before:right-1/2 before:bg-violet-500 before:h-1 before:transition-all hover:border-gray-300 before:duration-500 before:ease-out hover:before:left-0 hover:before:right-0`}
                                                >
                                                    <FontAwesomeIcon icon={faLayerGroup} className="bg-gray-100 rounded-lg p-4 text-violet-600 group-hover:scale-105 group-hover:bg-violet-400 group-hover:text-white duration-500 font-bold text-lg" />
                                                    <span className="mt-1 text-base font-semibold h-12">{item.name}</span>
                                                    <p className={`${((section.id === "categories" && query.categoryId === item.id) || (section.id === "authors" && query.authorId === item.id)) ? "text-white" : ""} font-semibold text-gray-500`}>({item.bookCount})</p>
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
                                    icon={faChevronDown}
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
                                                <Switch size="sm" checked={query.isPopular} onChange={() => {
                                                    setQuery(prev => ({
                                                        ...prev,
                                                        isPopular: prev.isPopular ? undefined : true,
                                                    }))
                                                }} />
                                            </div>
                                        </div>
                                        <div className="border-2 flex items-center flex-row rounded-xl p-4 mt-5 bg-gray-50">
                                            <FontAwesomeIcon icon={faFire} className="text-orange-400 mr-2 self-center" />
                                            <div className="mr-2">
                                                <p className="font-semibold text-[15px]">Mevcut kitaplar</p>
                                                <p className="text-sm text-gray-500">Sadece mevcut kitaplar</p>
                                            </div>
                                            <div className="ml-auto">
                                                <Switch size="sm" checked={query.isAvailable} onChange={() => {
                                                    setQuery(prev => ({
                                                        ...prev,
                                                        isAvailable: prev.isAvailable ? undefined : true,
                                                    }))
                                                }} />
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
    );
}