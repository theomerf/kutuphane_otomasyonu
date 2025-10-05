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
        if (userReviews.data) {
            console.log('sa');
            reset({
                id: selectedReviewId ?? 0,
                comment: userReviews.data.find(r => r.id === selectedReviewId)?.comment ?? undefined,
                rating: userReviews.data.find(r => r.id === selectedReviewId)?.rating ?? 0,
                bookId: userReviews.data.find(r => r.id === selectedReviewId)?.bookId ?? 0,
            })
        }
        setSelectedRating(userReviews.data?.find(r => r.id === selectedReviewId)?.rating ?? 0);
    }, [editCommentOpen]);

    return (
        <>
            <div className="flex flex-col cardBefore mx-5 lg:mx-20">
                <div className="flex flex-row py-2 relative justify-center">
                    <p className="text-violet-400 font-semibold text-2xl my-2">Kitap Değerlendirmeleri</p>
                    <button className="absolute right-0">
                        <FontAwesomeIcon icon={faChevronDown} className={`text-white w-6 h-6 rounded-full p-1 mx-1 my-2 bg-violet-400 text-2xl hover:scale-110 duration-500 ${sections.get("userReviews") ? "rotate-180" : ""}`} onClick={() => {
                            const newSections = new Map(sections);
                            newSections.set("userReviews", !sections.get("userReviews"));
                            setSections(newSections);
                        }} />
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
                            <div className="flex justify-center items-center h-64 text-red-500">
                                {userReviews.error}
                            </div>
                        )}

                        {userReviews.data && !userReviews.isLoading && (
                            <div className="gap-y-3 px-4 pb-10 max-h-[400px] overflow-y-auto">
                                {userReviews.data.length === 0 ? (
                                    <div className="flex flex-col justify-center text-center">
                                        <FontAwesomeIcon icon={faQuestion} className="text-violet-400 animate-pulse text-6xl text-center mt-10 mb-4 self-center" />
                                        <p className="text-gray-400 font-medium text-lg text-center">Henüz değerlendirme yapmadınız.</p>
                                        <Link to={`/books/${Math.floor(Math.random() * 102)}`} className="self-center mt-4 button hover:scale-105 duration-500 transition-all">Rastgele bir kitabı incele</Link>
                                    </div>
                                ) : (
                                    userReviews.data.map((review) => (
                                        <div key={review.id} className={`${up.lg ? "hover:bg-gray-100 hover:translate-x-2 hover:before:content-[''] hover:before:top-0 hover:before:absolute hover:before:left-0 hover:before:bottom-0 hover:before:w-1 hover:before:bg-hero-gradient hover:duration-500 duration-500 group" : ""} flex flex-col gap-y-6 rounded-lg shadow-md border bg-violet-50 border-gray-200 px-8 py-6 mb-6`}>
                                            <div className="flex flex-row">
                                                <p className="text-lg text-gray-400 font-semibold self-center"><span className="font-bold text-violet-500">Kitap Adı:</span> {review.bookTitle}</p>
                                                <div className="flex flex-row gap-x-2 ml-4">
                                                    <button onClick={() => {setEditCommentOpen(true); setSelectedReviewId(review.id);}} title="Düzenle" className="bg-yellow-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-8 h-8 hover:scale-105 hover:bg-yellow-600 duration-500 text-base">
                                                        <FontAwesomeIcon icon={faEdit} className="self-center" />
                                                    </button>
                                                    <button onClick={() => handleCommentDelete(review.id)} title="Sil" className="bg-red-500 rounded-lg text-center flex justify-center content-center align-middle text-white w-8 h-8 hover:scale-105 hover:bg-red-600 duration-500 text-base">
                                                        <FontAwesomeIcon icon={faTrash} className="self-center" />
                                                    </button>
                                                </div>
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
                                    ))
                                )}
                            </div>
                        )}</>
                )}
            </div>

            {editCommentOpen && (
                    <div className="fixed px-5 lg:px-0 inset-0 lg:inset-0 mt-20 overflow-auto lg:mt-20 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="flex flex-col bg-white rounded-3xl shadow-lg">
                            <div className="bg-violet-400 py-2 lg:py-6 flex flex-col text-center gap-y-1 px-10 lg:px-28 rounded-tr-3xl rounded-tl-3xl">
                                <p className="font-bold text-lg lg:text-xl text-white">
                                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                    Yorumu Düzenle
                                </p>
                            </div>
                            <div className="px-6">
                                <form method="POST" onSubmit={handleSubmit(handleCommentUpdate)} noValidate>
                                    <input type="hidden" {...register("id")} />
                                    <div className="flex flex-col gap-y-6 p-6">
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
                                    </div>
                                    <div className="flex content-center justify-center gap-x-4 mt-6 mb-6">
                                        <button type="submit" className="smallButton text-sm lg:button font-semibold lg:hover:scale-105">
                                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                            Onayla
                                        </button>
                                        <button type="button" onClick={() => {
                                            {
                                                setEditCommentOpen(false);
                                                reset();
                                                clearErrors();
                                            }
                                        }} className="smallButton text-sm lg:button font-semibold !bg-red-500 lg:hover:scale-105">
                                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                            Geri Dön
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }</>
    );
}