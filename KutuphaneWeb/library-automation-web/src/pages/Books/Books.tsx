import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { useEffect, useState } from "react";
import type BookRequestParameters from "../../types/bookRequestParameters";
import requests from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import type Book from "../../types/book";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faStar } from "@fortawesome/free-solid-svg-icons";

async function fetchBooks(query: BookRequestParameters) {
  const queryString = new URLSearchParams();
  for (const param in query) {
    if (query[param]) {
      queryString.append(param, query[param] as string);
    }
  }
  const res: Book[] = await requests.books.getAllBooks(queryString);
  return res;
}

export default function Books() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['books', page],
    queryFn: () => fetchBooks({ pageNumber: page.toString(), pageSize: "10" }),
  });
  const [query, setQuery] = useState<BookRequestParameters>({});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-10 gap-y-20 p-20">
      {data?.map(book => 
      <div key={book.Id} className="flex flex-col bg-white/90 relative p-3 lg:p-6 border-2 border-white/20 shadow-lg rounded-2xl hover:scale-110 duration-500">
        <div className="absolute top-[-30px] rotate-[20deg] text-center left-[-30px] z-[3] rounded-3xl bg-green-500 px-2 py-[10px] w-1/3 text-sm [text-transform:uppercase] mx-auto mt-3 font-semibold [letter-spacing:0.5px] text-white before:content-[''] before:absolute before:left-[-5px] before:top-2 before:bottom-0 before:w-[14px] before:h-[14px] before:bg-[radial-gradient(circle,rgba(217,_20,_20,_1)_0%,_rgba(201,_41,_20,_1)_100%)] before:[border-radius:50%]">{(book.AvailableCopies ?? 0) > 0 ? "Mevcut" : "Tükendi"}</div>       
        <div className=" h-[260px] overflow-hidden rounded-xl relative  after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-8 after:z-[1] bg-top bg-white/0">
          <img src={book.Images![0].ImageUrl ?? "https://placehold.co/200"} className="w-full h-full object-contain p-5 hover:scale-110 duration-700" alt="Book Cover" />
        </div>
        <div className="flex flex-col text-center content-center justify-center mt-1 h-[120px]">
          <h5 className="font-bold text-lg m-0 overflow-hidden text-[#1e293b] [text-shadow:_0_1px_2px_rgba(0,_0,_0,_0.05)]">{book.Title}</h5>
          <div className="mt-2"><FontAwesomeIcon icon={faStar} className="w-1/2"></FontAwesomeIcon></div>
        </div>
        <div className="flex justify-center gap-3 mt-2">
          <button className="w-full py-[14px] border-none rounded-3xl shadow-violet-400 shadow-lg bg-hero-gradient text-white font-bold text-base items-center justify-center gap-3 duration-[0.4s] [text-transform:uppercase] cursor-pointer relative overflow-hidden">
            <span className="mr-2 [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.1)]">Sepete Ekle</span>
            <FontAwesomeIcon icon={faCartPlus} className="mr-1"></FontAwesomeIcon>
            </button>
        </div>
      </div>
      )}

    </div>

  )
}