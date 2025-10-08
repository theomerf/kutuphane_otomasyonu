import { faArrowLeft, faCalendar, faCheck, faChevronDown, faEdit, faStar, faQuestion, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { BackendDataList } from "../../types/backendDataList";
import { Rating } from "../../components/ui/Rating";
import type UserReview from "../../types/userReview";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import requests from "../../services/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

type Props = {
    userReviews: BackendDataList<UserReview>;
    sections: Map<string, boolean>;
    setSections: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
    up: Record<"sm" | "md" | "lg" | "xl" | "2xl", boolean>;
    setRefreshComments: React.Dispatch<React.SetStateAction<number>>;
};

export default function ProfileReviews({ userReviews, sections, setSections, up, setRefreshComments }: Props) {
    const [editCommentOpen, setEditCommentOpen] = useState<boolean>(false);
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
    const { register, handleSubmit, reset, setValue, clearErrors, formState: { errors } } = useForm({
        defaultValues: {
            id: 0,
            comment: "",
            rating: 0,
            bookId: 0,
        }
    });

    const handleCommentUpdate = async (formData: any) => {
        try {
            setEditCommentOpen(false);
            setSelectedReviewId(null);
            await requests.userReview.updateUserReview(formData);
            setRefreshComments(prev => prev + 1);
            toast.success("Yorum başarıyla güncellendi.");
        }
        catch (error: any) {
            console.error("Yorum güncellenirken bir hata oluştu.", error);
            toast.error("Yorum güncellenirken bir hata oluştu.");
        }
    };

    const handleCommentDelete = async (id: number) => {
        if (!window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
        
        try {
            await requests.userReview.deleteUserReview(id);
            setRefreshComments(prev => prev + 1);
            toast.success("Yorum başarıyla silindi.");
        }
        catch (error: any) {
            console.error("Yorum silinirken bir hata oluştu.", error);
            toast.error("Yorum silinirken bir hata oluştu.");
        }
    }

    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [selectedRating, setSelectedRating] = useState<number>(0);

    const handleStarHover = (star: number) => setHoveredRating(star);
    const handleStarLeave = () => setHoveredRating(null);
    const handleStarClick = (star: number) => {
        setSelectedRating(star);
        setValue("rating", star, { shouldValidate: true });
    };

    useEffect(() => {
        clearErrors();
        if (userReviews.data && selectedReviewId) {
            const selectedReview = userReviews.data.find(r => r.id === selectedReviewId);
            reset({
                id: selectedReviewId,
                comment: selectedReview?.comment ?? "",
                rating: selectedReview?.rating ?? 0,
                bookId: selectedReview?.bookId ?? 0,
            });
            setSelectedRating(selectedReview?.rating ?? 0);
        }
    }, [editCommentOpen, selectedReviewId]);

    return (
        <>
            <div className="flex flex-col cardBefore mx-2 lg:mx-20">
                <div className="flex flex-row py-2 relative justify-center">
                    <p className="text-violet-400 font-semibold text-xl lg:text-2xl my-2">Kitap Değerlendirmeleri</p>
                    <button className="absolute right-2 lg:right-0">
                        <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`text-white w-5 h-5 lg:w-6 lg:h-6 rounded-full p-1 mx-1 my-2 bg-violet-400 hover:scale-110 duration-500 ${sections.get("userReviews") ? "rotate-180" : ""}`} 
                            onClick={() => {
                                const newSections = new Map(sections);
                                newSections.set("userReviews", !sections.get("userReviews"));
                                setSections(newSections);
                            }} 
                        />
                    </button>
                </div>

                {sections.get("userReviews") && (
                    <>
                        {(userReviews.isLoading) && (
                            <div className="flex justify-center items-center h-64">
                                <ClipLoader size={40} color="#8B5CF6" />
                            </div>
                        )}

                        {userReviews.error && (
                            <div className="flex justify-center items-center h-64 text-red-500 text-sm lg:text-base px-2 text-center">
                                {userReviews.error}
                            </div>
                        )}

                        {userReviews.data && !userReviews.isLoading && (
                            <div className="gap-y-3 px-2 lg:px-4 pb-6 lg:pb-10 max-h-[400px] overflow-y-auto">
                                {userReviews.data.length === 0 ? (
                                    <div className="flex flex-col justify-center text-center px-4">
                                        <FontAwesomeIcon icon={faQuestion} className="text-violet-400 animate-pulse text-4xl lg:text-6xl text-center mt-6 lg:mt-10 mb-3 lg:mb-4 self-center" />
                                        <p className="text-gray-400 font-medium text-base lg:text-lg text-center">Henüz değerlendirme yapmadınız.</p>
                                        <Link to={`/books/${Math.floor(Math.random() * 102)}`} className="self-center mt-3 lg:mt-4 button hover:scale-105 duration-500 transition-all text-sm lg:text-base">
                                            Rastgele bir kitabı incele
                                        </Link>
                                    </div>
                                ) : (
                                    userReviews.data.map((review) => (
                                        <div 
                                            key={review.id} 
                                            className={`${up.lg ? "hover:bg-gray-100 hover:translate-x-2 hover:before:content-[''] hover:before:top-0 hover:before:absolute hover:before:left-0 hover:before:bottom-0 hover:before:w-1 hover:before:bg-hero-gradient hover:duration-500 duration-500" : ""} flex flex-col gap-y-4 lg:gap-y-6 rounded-lg shadow-md border bg-violet-50 border-gray-200 px-4 lg:px-8 py-4 lg:py-6 mb-4 lg:mb-6`}
                                        >
                                            <div className="flex flex-col lg:flex-row gap-3 lg:gap-0">
                                                <p className="text-sm lg:text-lg text-gray-400 font-semibold break-words">
                                                    <span className="font-bold text-violet-500">Kitap:</span> {review.bookTitle}
                                                </p>
                                                
                                                <div className="flex flex-row gap-x-2 lg:ml-4">
                                                    <button 
                                                        onClick={() => { setEditCommentOpen(true); setSelectedReviewId(review.id); }} 
                                                        title="Düzenle" 
                                                        className="bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-7 h-7 lg:w-8 lg:h-8 hover:scale-105 hover:bg-yellow-600 duration-500 text-sm lg:text-base"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="self-center" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCommentDelete(review.id)} 
                                                        title="Sil" 
                                                        className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-7 h-7 lg:w-8 lg:h-8 hover:scale-105 hover:bg-red-600 duration-500 text-sm lg:text-base"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="self-center" />
                                                    </button>
                                                </div>

                                                <div className="lg:ml-auto flex flex-col lg:flex-row gap-2 lg:gap-0 items-start lg:items-center">
                                                    <span className="text-xs lg:text-base mr-0 lg:mr-6">
                                                        <FontAwesomeIcon icon={faCalendar} className="text-violet-400 mr-2" />
                                                        {review.createdAt.toString().split('T')[0]}
                                                    </span>
                                                    <div className="scale-90 lg:scale-100 origin-left">
                                                        <Rating rating={review.rating} />
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <div className="rounded-lg border-gray-200 border-2 bg-white px-3 lg:px-4 py-4 lg:py-8 text-sm lg:text-base break-words">
                                                    {review.comment}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {editCommentOpen && (
                <div className="fixed inset-0 px-4 lg:px-0 mt-20 overflow-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="flex flex-col bg-white rounded-3xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-violet-400 py-4 lg:py-6 flex flex-col text-center gap-y-1 px-6 lg:px-28 rounded-tr-3xl rounded-tl-3xl sticky top-0 z-10">
                            <p className="font-bold text-lg lg:text-xl text-white">
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Yorumu Düzenle
                            </p>
                        </div>
                        
                        <div className="px-4 lg:px-6">
                            <form method="POST" onSubmit={handleSubmit(handleCommentUpdate)} noValidate>
                                <input type="hidden" {...register("id")} />
                                <input type="hidden" {...register("bookId")} />
                                
                                <div className="flex flex-col gap-y-4 lg:gap-y-6 p-4 lg:p-6">
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
                                                    className="mr-1 text-xl lg:text-2xl group"
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
                                            <span className="text-red-700 text-left mt-1 text-xs lg:text-sm">{errors.rating.message}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col w-full">
                                        <label htmlFor="comment" className="font-bold text-gray-500 text-sm lg:text-base">
                                            Yorumunuz
                                        </label>
                                        <textarea
                                            {...register("comment", {
                                                maxLength: { value: 1000, message: "Maksimum 1000 karakter girebilirsiniz." },
                                            })}
                                            id="comment"
                                            name="comment"
                                            rows={6}
                                            className="input w-full mt-3 lg:mt-4 resize-none text-sm lg:text-base"
                                            placeholder="Yorumunuzu buraya yazın..."
                                        />
                                        {errors.comment && (
                                            <span className="text-red-700 text-left mt-1 text-xs lg:text-sm">
                                                {errors.comment?.message?.toString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row content-center justify-center gap-3 lg:gap-x-4 mt-4 lg:mt-6 mb-4 lg:mb-6 px-4 lg:px-6">
                                    <button 
                                        type="submit" 
                                        className="button font-semibold hover:scale-105 w-full lg:w-auto text-sm lg:text-base order-1 lg:order-1"
                                    >
                                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                        Onayla
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setEditCommentOpen(false);
                                            setSelectedReviewId(null);
                                            reset();
                                            clearErrors();
                                        }} 
                                        className="button font-semibold !bg-red-500 hover:!bg-red-600 hover:scale-105 w-full lg:w-auto text-sm lg:text-base order-2 lg:order-2"
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                        Geri Dön
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}