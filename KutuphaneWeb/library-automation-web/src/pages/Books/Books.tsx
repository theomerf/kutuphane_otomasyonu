import { useMemo, useState, useEffect, useCallback } from "react";
import type BookRequestParameters from "../../types/bookRequestParameters";
import requests from "../../services/api";
import type Book from "../../types/book";
import { ClipLoader } from "react-spinners";
import type PaginationHeader from "../../types/paginationHeader";
import { useDebounce } from "../../hooks/useDebounce";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import Filters, { type FilterSection } from "../../components/books/Filters";
import BookPagination from "../../components/books/BookPagination";
import { motion } from "framer-motion";
import BookCard from "../../components/books/BookCard";
import { useSearchParams } from "react-router-dom";

export default function Books() {
  const [openSections, setOpenSections] = useState<string[]>(["categories", "authors", "other"]);
  const isOthersOpen: boolean = openSections.includes("other");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Book[] | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterSection[]>([]);
  const { up } = useBreakpoint();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState<PaginationHeader>({
    CurrentPage: 1,
    TotalPage: 0,
    PageSize: 6,
    TotalCount: 0,
    HasPrevious: false,
    HasPage: false
  });

  const getInitialSearchFromUrl = () => {
    const searchTerm = searchParams.get("searchTerm");
    return searchTerm || "";
  }
  const [searchInput, setSearchInput] = useState<string>(getInitialSearchFromUrl());
  const debouncedSearch = useDebounce(searchInput, 500);

  const getQueriesFromUrl = () => {
    const pageNumber = searchParams.get("pageNumber");
    const pageSize = searchParams.get("pageSize");
    const searchTerm = searchParams.get("searchTerm");
    const orderBy = searchParams.get("orderBy");
    const authorId = searchParams.get("authorId");
    const categoryId = searchParams.get("categoryId");
    const isAvailable = searchParams.get("isAvailable");
    const isPopular = searchParams.get("isPopular");

    return ({
      pageNumber: pageNumber ? parseInt(pageNumber) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 6,
      searchTerm: searchTerm || undefined,
      orderBy: orderBy || undefined,
      authorId: authorId ? parseInt(authorId) : undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      isAvailable: isAvailable ? isAvailable === "true" : undefined,
      isPopular: isPopular ? isPopular === "true" : undefined
    });
  }

  const [query, setQuery] = useState<BookRequestParameters>(getQueriesFromUrl());

  const finalQuery = useMemo(() => ({
    ...query,
    searchTerm: debouncedSearch || undefined
  }), [query, debouncedSearch]);

  const modifyUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (finalQuery.pageNumber && finalQuery.pageNumber !== 1) {
      params.set("pageNumber", finalQuery.pageNumber.toString());
    }
    if (finalQuery.pageSize && finalQuery.pageSize !== 6) {
      params.set("pageSize", finalQuery.pageSize.toString());
    }
    if (finalQuery.searchTerm) {
      params.set("searchTerm", finalQuery.searchTerm);
    }
    if (finalQuery.orderBy) {
      params.set("orderBy", finalQuery.orderBy);
    }
    if (finalQuery.authorId) {
      params.set("authorId", finalQuery.authorId.toString());
    }
    if (finalQuery.categoryId) {
      params.set("categoryId", finalQuery.categoryId.toString());
    }
    if (finalQuery.isAvailable !== undefined) {
      params.set("isAvailable", finalQuery.isAvailable.toString());
    }
    if (finalQuery.isPopular !== undefined) {
      params.set("isPopular", finalQuery.isPopular.toString());
    }

    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();

    if (newParamsString !== currentParamsString) {
      setSearchParams(params, { replace: true });
    }
  }, [finalQuery, searchParams]);

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
    modifyUrl();
  }, [finalQuery]);

  useEffect(() => {
    const controller = new AbortController();

    const loadBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const books = await fetchBooks(finalQuery, controller.signal);
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
                  <BookCard key={book.id} book={book} />
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