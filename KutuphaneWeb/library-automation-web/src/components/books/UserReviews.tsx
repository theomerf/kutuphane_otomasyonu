import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type UserReview from "../../types/userReview";
import { faCalendar, faCheck, faComment, faPenAlt, faStar } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import requests from "../../services/api";
import { ClipLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { Rating } from "../ui/Rating";

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
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [selectedRating, setSelectedRating] = useState<number>(0);

    const fetchReviews = async () => {
        try {
            const response = await requests.userReview.getUserReviewsByBookId(bookId);
            return response.data as UserReview[];
        } catch (error) {
            toast.error("Değerlendirmeler yüklenirken bir hata oluştu.");
            return [];
        }
    };

    useEffect(() => {
        const loadReviews = async () => {
            const fetchedReviews = await fetchReviews();
            setReviews(fetchedReviews);
        };

        loadReviews();
    }, []);

    const handleReviewCreation = async (formData: any) => {
        if (!selectedRating) {
            toast.error("Lütfen puanınızı seçin.");
            return;
        }
        try {
            setIsLoading(true);
            await requests.userReview.createUserReview({ ...formData, rating: selectedRating });
            toast.success("Değerlendirme başarıyla oluşturuldu.");
            reset();
            setSelectedRating(0);
            setHoveredRating(null);
        }
        catch (error) {
            toast.error("Değerlendirme oluşturulurken bir hata oluştu.");
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleStarHover = (star: number) => setHoveredRating(star);
    const handleStarLeave = () => setHoveredRating(null);
    const handleStarClick = (star: number) => {
        setSelectedRating(star);
        setValue("rating", star, { shouldValidate: true });
    };

    return (
        <div className="flex flex-col gap-6">
            {reviews.length === 0 ? (
                <div className="flex flex-col text-center content-center items-center justify-center mt-5 mb-8">
                    <FontAwesomeIcon icon={faComment} className="text-violet-400 text-6xl mb-4 animate-pulse" />
                    <p className="text-gray-500 font-bold text-2xl">Henüz değerlendirme yok.</p>
                    <p className="text-gray-400 font-semibold text-base mt-2">İlk değerlendirmeyi siz yapın.</p>
                </div>
            ) : (
                <div>
                    {reviews.map((review) => (
                        <div key={review.id} className="flex flex-col gap-y-6 rounded-lg shadow-md border bg-violet-50 border-gray-200 px-8 py-6 mb-6">
                            <div className="flex flex-row">
                                <p className="font-semibold text-gray-500 text-lg text-left">
                                    <FontAwesomeIcon icon={faPenAlt} className="text-violet-400 mr-2" />
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
                            {review.comment &&
                                <div className="rounded-lg border-gray-200 border-2 bg-white px-4 py-8">
                                    {review.comment}
                                </div>
                            }
                        </div>
                    ))}
                </div>
            )}
            <form method="POST" onSubmit={handleSubmit(handleReviewCreation)}>
                <div className="py-10 text-center bg-violet-500 rounded-tl-lg rounded-tr-lg">
                    <p className="text-white font-bold text-3xl">
                        <FontAwesomeIcon icon={faComment} className="mr-2" />
                        Değerlendirme Ekle
                    </p>
                </div>
                <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 px-8 py-10">
                    <div className="flex flex-col w-full">
                        <p className="font-bold text-gray-500 text-base">Puanlamanız:</p>
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
                                    className="mr-1 text-2xl group"
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
                        <label htmlFor="comment" className="font-bold text-gray-500 text-base">Yorumunuz</label>
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
                    <div className="mt-10 justify-center flex px-20">
                        <button
                            type="submit"
                            className="button w-1/2 font-bold text-lg !py-4 hover:scale-105 duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ClipLoader size={20} color="#fff" />
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    Onayla
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}