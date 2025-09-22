import type PaginationHeader from "../../types/paginationHeader";
import { Pagination } from "../../components/ui/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";
import type Category from "../../types/category";
import type { RequestParameters } from "../../types/bookRequestParameters";

type CategoryPaginationProps = {
    data: Category[] | null;
    pagination: PaginationHeader;
    isLoading: boolean;
    error: string | null;
    setQuery: React.Dispatch<React.SetStateAction<RequestParameters>>
    up: Record<"lg" | "sm" | "md" | "xl" | "2xl", boolean>;
    query: RequestParameters;
}

export default function CategoryPagination({ data, pagination, isLoading, error, up, query, setQuery }: CategoryPaginationProps) {
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

    const shouldShowPagination = pagination.TotalPage! > 1 && !isLoading && !error;

    return (
        <>
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
        </>
    )
}