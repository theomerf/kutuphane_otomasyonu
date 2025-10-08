import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type UserReview from "../../types/userReview";
import { faCalendar, faCheck, faComment, faExclamation, faStar } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import requests from "../../services/api";
import { ClipLoader } from "react-spinners";
import { useEffect, useReducer, useState } from "react";
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { Rating } from "../ui/Rating";
import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import BackendDataListReducer from "../../types/backendDataList";
import { useBreakpoint } from "../../hooks/useBreakpoint";

type UserReviewsProps = {
    bookId: number;
};

export default function UserReviews({ bookId }: UserReviewsProps) {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            comment: undefined,
            rating: 0,
            bookId: bookId
        }
    });
    const [refreshReviews, setRefreshReviews] = useState(0);
    const { user } = useSelector((state: RootState) => state.account);
    const [reviews, dispatch] = useReducer(BackendDataListReducer<UserReview>, {
        data: null,
        isLoading: false,
        error: null
    });
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const { up } = useBreakpoint();

    const fetchReviews = async (signal: AbortSignal) => {
        dispatch({ type: "FETCH_START" });
        try {
            const response = await requests.userReview.getUserReviewsByBookId(bookId, signal);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data as UserReview[] });
        } catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                return;
            }
            else {
                toast.error("Değerlendirmeler yüklenirken bir hata oluştu.");
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Değerlendirmeler yüklenirken bir hata oluştu." });
            }
        }
    };

    const handleReviewCreation = async (formData: any) => {
        if (!selectedRating) {
            toast.error("Lütfen puanınızı seçin.");
            return;
        }
        try {
            await requests.userReview.createUserReview({ ...formData, rating: selectedRating });
            toast.success("Değerlendirme başarıyla oluşturuldu.");
            reset();
            setSelectedRating(0);
            setHoveredRating(null);
            setRefreshReviews(prev => prev + 1);
        }
        catch (error) {
            toast.error("Değerlendirme oluşturulurken bir hata oluştu.");
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchReviews(controller.signal);

        return () => {
            controller.abort();
        };
    }, [refreshReviews]);

    const handleStarHover = (star: number) => setHoveredRating(star);
    const handleStarLeave = () => setHoveredRating(null);
    const handleStarClick = (star: number) => {
        setSelectedRating(star);
        setValue("rating", star, { shouldValidate: true });
    };

    return (
        <div className="flex flex-col gap-6">
            {reviews.data?.length === 0 ? (
                <div className="flex flex-col text-center content-center items-center justify-center lg:mt-5 lg:mb-8">
                    <FontAwesomeIcon icon={faComment} className="text-violet-400 text-4xl lg:text-6xl mb-4 animate-pulse" />
                    <p className="text-gray-500 font-bold text-lg lg:text-2xl">Henüz değerlendirme yok.</p>
                    <p className="text-gray-400 font-semibold text-sm lg:text-base mt-2">İlk değerlendirmeyi siz yapın.</p>
                </div>
            ) : (
                <div>
                    {reviews.data?.map((review) => (
                        <div key={review.id} className="flex flex-col gap-y-6 rounded-lg shadow-md border bg-violet-50 border-gray-200 px-4 py-2 lg:px-8 lg:py-6 mb-6">
                            {up.lg ? (
                                <div className="flex flex-row">
                                    <img src={"https://localhost:7214/images/" + review.accountAvatarUrl} alt="User Avatar" className="w-12 h-12 rounded-full mr-4" />
                                    <p className="font-semibold text-gray-500 text-lg text-left self-center">
                                        {review.accountUserName}
                                    </p>
                                    <div className="ml-auto">
                                        <span className="mr-6">
                                            <FontAwesomeIcon icon={faCalendar} className="text-violet-400 mr-2" />
                                            {review.createdAt.toString().split('T')[0]}
                                        </span>
                                        <Rating rating={review.rating} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <div className="flex flex-row mb-4">
                                        <img src={"https://localhost:7214/images/" + review.accountAvatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full mr-4" />
                                        <p className="font-semibold text-gray-500 text-base text-left self-center">
                                            {review.accountUserName}
                                        </p>
                                    </div>
                                    <div className="flex flex-row mb-4">
                                        <Rating rating={review.rating} />
                                        <span className="ml-auto text-xs">
                                            <FontAwesomeIcon icon={faCalendar} className="text-violet-400 mr-2" />
                                            {review.createdAt.toString().split('T')[0]}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {review.comment &&
                                <div className="rounded-lg border-gray-200 border-2 text-xs lg:text-base bg-white px-4 py-8">
                                    {review.comment}
                                </div>
                            }
                        </div>
                    ))}
                </div>
            )}
            {!user ? (
                <div className="flex justify-center rounded-lg w-fit self-center px-4 py-2 shadow-md border-gray-200 border">
                    <FontAwesomeIcon icon={faExclamation} className="mr-2 self-center text-xl text-yellow-400 animate-pulse" />
                    <p className="lg:text-lg font-semibold text-gray-500">
                        Değerlendirme eklemek için lütfen giriş yapın.
                    </p>
                </div>
            ) : (
                <form method="POST" onSubmit={handleSubmit(handleReviewCreation)}>
                    <div className="px-2 py-4 lg:py-10 text-center bg-violet-500 rounded-tl-lg rounded-tr-lg">
                        <p className="text-white font-bold text-sm lg:text-3xl">
                            <FontAwesomeIcon icon={faComment} className="mr-2" />
                            Değerlendirme Ekle
                        </p>
                    </div>
                    <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 px-8 py-10">
                        <div className="flex flex-col w-full">
                            <p className="font-bold text-gray-500 text-sm lg:text-base">Puanlamanız:</p>
                            <div
                                onMouseLeave={handleStarLeave}
                                className="mt-3 w-fit"
                            >
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => handleStarClick(star)}
                                        onMouseEnter={() => handleStarHover(star)}
                                        className="mr-1 text-base lg:text-2xl group"
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                (hoveredRating
                                                    ? star <= hoveredRating
                                                    : star <= selectedRating)
                                                    ? faStar
                                                    : farStar
                                            }
                                            className="text-yellow-300 group-hover:scale-125 transition-all duration-200"
                                        />
                                    </button>
                                ))}
                            </div>
                            <input
                                type="hidden"
                                {...register("rating", {
                                    required: "Puanlama zorunludur.",
                                    min: { value: 1, message: "Minimum 1 puan verilmelidir." },
                                    max: { value: 5, message: "Maksimum 5 puan verilmelidir." }
                                })}
                                value={selectedRating}
                                readOnly
                            />
                            {errors.rating && (
                                <span className="text-red-700 text-left mt-1">{errors.rating.message}</span>
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <label htmlFor="comment" className="font-bold text-gray-500 text-sm lg:text-base">Yorumunuz</label>
                            <textarea
                                {...register("comment", {
                                    maxLength: { value: 1000, message: "Maksimum 1000 karakter girebilirsiniz." },
                                })}
                                id="comment"
                                name="comment"
                                className="input w-full mt-4 resize-none"
                            />
                            {errors.comment && <span className="text-red-700 text-left mt-1">{errors.comment?.message?.toString()}</span>}
                        </div>
                        <div className="lg:mt-10 justify-center flex px-20">
                            <button
                                type="submit"
                                className="button w-fit flex flex-row font-bold text-sm lg:text-lg lg:!py-4 hover:scale-105 duration-300"
                                disabled={reviews.isLoading}
                            >
                                {reviews.isLoading ? (
                                    <ClipLoader size={20} color="#fff" />
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCheck} className="self-center mr-2" />
                                        Onayla
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}