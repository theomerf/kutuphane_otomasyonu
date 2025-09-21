import { useEffect, useState } from "react";
import type Book from "../../../types/book";
import requests from "../../../services/api";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faEdit, faPlus, faTimes, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type Author from "../../../types/author";
import type Category from "../../../types/category";
import type Tag from "../../../types/tag";
import { toast } from "react-toastify";

type BookDetail = {
    error: string | null;
    book?: Book | null;
    relatedBookList?: Book[] | null;
    loading: boolean;
}

export function UpdateBook() {
    const navigate = useNavigate();
    const [bookDetail, setBookDetail] = useState<BookDetail>({
        error: null,
        book: null,
        loading: false
    });

    // Yeni state'ler
    const [allAuthors, setAllAuthors] = useState<Author[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            title: "",
            isbn: "",
            availableCopies: 0,
            totalCopies: 0,
            location: "",
            publishedDate: "",
            summary: "",
        }
    });

    // Backend'den listeleri çek
    const fetchSelectionLists = async () => {
        try {
            const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
                requests.authors.getAllAuthors(),
                requests.categories.getAllCategories(),
                requests.tags.getAllTags(),
            ]);

            setAllAuthors(authorsRes.data || []);
            setAllCategories(categoriesRes.data || []);
            setAllTags(tagsRes.data || [])
        } catch (error) {
            console.error("Seçim listeleri yüklenirken hata:", error);
        }
    };

    useEffect(() => {
        fetchSelectionLists();
    }, []);

    useEffect(() => {
        if (bookDetail.book) {
            reset({
                title: bookDetail.book.title || "",
                isbn: bookDetail.book.isbn || "",
                availableCopies: bookDetail.book.availableCopies ?? 0,
                totalCopies: bookDetail.book.totalCopies ?? 0,
                location: bookDetail.book.location || "",
                publishedDate: bookDetail.book.publishedDate
                    ? new Date(bookDetail.book.publishedDate).toISOString().split("T")[0]
                    : "",
                summary: bookDetail.book.summary || "",
            });

            // Mevcut seçimleri set et
            setSelectedAuthors(bookDetail.book.authors || []);
            setSelectedCategories(bookDetail.book.categories || []);
            setSelectedTags(bookDetail.book.tags || []);
            setExistingImages(bookDetail.book.images || []);
        }
    }, [bookDetail.book, reset]);

    const fetchBooks = async (id: string, signal?: AbortSignal) => {
        try {
            setBookDetail(prev => ({
                ...prev,
                loading: true,
            }));
            const response = await requests.books.getOneBook(id, signal);

            setBookDetail({
                book: response.data as Book,
                loading: false,
                error: null
            });
        }
        catch (error) {
            setBookDetail({
                book: null,
                loading: false,
                error: 'Kitap bilgileri çekilirken hata oluştu.'
            });
            throw error;
        }
    };

    const handleBookCreation = async (formData: any) => {
        try {
            const form = new FormData();

            // Kitap ID'sini ekle
            form.append('Id', bookDetail.book!.id!.toString());

            // Temel form alanları
            form.append('Title', formData.title);
            form.append('ISBN', formData.isbn);
            form.append('AvailableCopies', formData.availableCopies.toString());
            form.append('TotalCopies', formData.totalCopies.toString());
            form.append('Location', formData.location);
            form.append('PublishedDate', formData.publishedDate);
            form.append('Summary', formData.summary);

            // Seçili ID'leri ekle
            selectedAuthors.forEach((author, index) => {
                form.append(`AuthorIds[${index}]`, author.id!.toString());
            });

            selectedCategories.forEach((category, index) => {
                form.append(`CategoryIds[${index}]`, category.id!.toString());
            });

            selectedTags.forEach((tag, index) => {
                form.append(`TagIds[${index}]`, tag.id!.toString());
            });

            // Mevcut fotoğrafları koru
            existingImages.forEach((image, index) => {
                form.append(`ExistingImageIds[${index}]`, image.id!.toString());
            });

            // Yeni fotoğrafları ekle
            newImages.forEach((file) => {
                form.append('NewImages', file);
            });

            await requests.books.updateBook(form);

            toast.success('Kitap başarıyla güncellendi!');
            navigate('/admin/books');

        } catch (error: any) {
            console.error('Güncelleme hatası:', error);
            toast.error('Güncelleme sırasında hata oluştu.');
        }
    };

    // Yazar ekleme
    const addAuthor = () => {
        if (selectedAuthorId && !selectedAuthors.find(a => a.id === selectedAuthorId)) {
            const author = allAuthors.find(a => a.id === selectedAuthorId);
            if (author) {
                setSelectedAuthors([...selectedAuthors, author]);
                setSelectedAuthorId(null);
            }
        }
    };

    // Kategori ekleme
    const addCategory = () => {
        if (selectedCategoryId && !selectedCategories.find(c => c.id === selectedCategoryId)) {
            const category = allCategories.find(c => c.id === selectedCategoryId);
            if (category) {
                setSelectedCategories([...selectedCategories, category]);
                setSelectedCategoryId(null);
            }
        }
    };

    // Etiket ekleme
    const addTag = () => {
        if (selectedTagId && !selectedTags.find(t => t.id === selectedTagId)) {
            const tag = allTags.find(t => t.id === selectedTagId);
            if (tag) {
                setSelectedTags([...selectedTags, tag]);
                setSelectedTagId(null);
            }
        }
    };

    // Öğe silme fonksiyonları
    const removeAuthor = (authorId: number | null) => {
        setSelectedAuthors(selectedAuthors.filter(a => a.id !== authorId));
    };

    const removeCategory = (categoryId: number | null) => {
        setSelectedCategories(selectedCategories.filter(c => c.id !== categoryId));
    };

    const removeTag = (tagId: number | null) => {
        setSelectedTags(selectedTags.filter(t => t.id !== tagId));
    };

    // Fotoğraf işlemleri
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            setNewImages([...newImages, ...files]);

            // Önizlemeler oluştur
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreviews(prev => [...prev, e.target?.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages(newImages.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId: number | null) => {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
    };

    useEffect(() => {
        const id: string = window.location.pathname.split('/').pop() || '';
        fetchBooks(id);
    }, []);

    return (
        <>
            {(bookDetail.loading) && (
                <div className="flex justify-center items-center h-64">
                    <ClipLoader size={40} color="#8B5CF6" />
                </div>
            )}

            {bookDetail.error && (
                <div className="flex justify-center items-center h-64 text-red-500">
                    Kitap bilgisi yüklenirken bir hata oluştu.
                </div>
            )}
            {bookDetail.book && !bookDetail.loading &&
                <div className="flex flex-col px-8 lg:px-80">
                    <form method="POST" onSubmit={handleSubmit(handleBookCreation)} noValidate>
                        <div className="py-10 text-center bg-violet-500 rounded-tl-lg rounded-tr-lg">
                            <p className="text-white font-bold text-3xl">
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Kitap Id: {bookDetail.book.id} - Düzenle
                            </p>
                        </div>
                        <div className="flex flex-col gap-y-6 rounded-lg shadow-xl bg-white border border-gray-200 px-8 py-10">

                            {/* Mevcut form alanları - Değişiklik YOK */}
                            <div className="flex flex-row gap-x-10">
                                <div className="flex flex-col w-1/2">
                                    <label htmlFor="title" className="font-bold text-gray-500 text-base">Kitap Başlığı</label>
                                    <input type="text" {...register("title", {
                                        required: "Başlık bilgisi gereklidir.",
                                        minLength: {
                                            value: 3,
                                            message: "Başlık min. 3 karakter olmalıdır."
                                        }
                                    })} id="title" name="title" className="input w-full mt-4" />
                                    {errors.title && <span className="text-red-700 text-left mt-1">{errors.title?.message?.toString()}</span>}
                                </div>
                                <div className="flex flex-col w-1/2">
                                    <label htmlFor="isbn" className="font-bold text-gray-500 text-base">ISBN</label>
                                    <input type="text" {...register("isbn", {
                                        required: "ISBN bilgisi gereklidir.",
                                        minLength: {
                                            value: 13,
                                            message: "ISBN 13 karakter olmalıdır."
                                        },
                                        maxLength: {
                                            value: 13,
                                            message: "ISBN 13 karakter olmalıdır."
                                        }
                                    })} id="isbn" name="isbn" className="input w-full mt-4" />
                                    {errors.isbn && <span className="text-red-700 text-left mt-1">{errors.isbn?.message?.toString()}</span>}
                                </div>
                            </div>
                            <div className="flex flex-row gap-x-10">
                                <div className="flex flex-col w-1/2">
                                    <label htmlFor="availableCopies" className="font-bold text-gray-500 text-base">Mevcut Kopya</label>
                                    <input type="number" {...register("availableCopies", {
                                        required: "Mevcut kopya bilgisi gereklidir.",
                                        min: {
                                            value: 0,
                                            message: "Mevcut kopya 0 veya daha büyük olmalıdır."
                                        },
                                        valueAsNumber: true
                                    })} id="availableCopies" name="availableCopies" className="input w-full mt-4" />
                                    {errors.availableCopies && <span className="text-red-700 text-left mt-1">{errors.availableCopies?.message?.toString()}</span>}
                                </div>
                                <div className="flex flex-col w-1/2">
                                    <label htmlFor="totalCopies" className="font-bold text-gray-500 text-base">Toplam Kopya</label>
                                    <input type="number" {...register("totalCopies", {
                                        required: "Toplam kopya bilgisi gereklidir.",
                                        min: {
                                            value: 1,
                                            message: "Toplam kopya en az 1 olmalıdır."
                                        },
                                        valueAsNumber: true
                                    })} id="totalCopies" name="totalCopies" className="input w-full mt-4" />
                                    {errors.totalCopies && <span className="text-red-700 text-left mt-1">{errors.totalCopies?.message?.toString()}</span>}
                                </div>
                            </div>
                            <div className="flex flex-row gap-x-10">
                                <div className="flex flex-col w-1/2">
                                    <label htmlFor="location" className="font-bold text-gray-500 text-base">Yer</label>
                                    <input type="text" {...register("location", {
                                        required: "Yer bilgisi gereklidir.",
                                    })} id="location" name="location" className="input w-full mt-4" />
                                    {errors.location && <span className="text-red-700 text-left mt-1">{errors.location?.message?.toString()}</span>}
                                </div>
                                <div className="flex flex-col w-1/2">
                                    <label htmlFor="publishedDate" className="font-bold text-gray-500 text-base">Yayınlanma Tarihi</label>
                                    <input type="date" {...register("publishedDate", {
                                        required: "Yayın tarihi gereklidir.",
                                    })} id="publishedDate" name="publishedDate" className="input w-full mt-4" />
                                    {errors.publishedDate && <span className="text-red-700 text-left mt-1">{errors.publishedDate?.message?.toString()}</span>}
                                </div>
                            </div>
                            <div className="flex flex-col w-full">
                                <label htmlFor="summary" className="font-bold text-gray-500 text-base">Özet</label>
                                <textarea {...register("summary", {
                                    required: "Özet bilgisi gereklidir.",
                                })} id="summary" name="summary" className="input w-full mt-4 resize-none h-24" />
                                {errors.summary && <span className="text-red-700 text-left mt-1">{errors.summary?.message?.toString()}</span>}
                            </div>

                            {/* YENİ BÖLÜMLER: Dinamik Seçim Alanları */}

                            {/* Yazarlar */}
                            <div className="flex flex-col w-full">
                                <label className="font-bold text-gray-500 text-base mb-4">Yazarlar</label>
                                <div className="flex gap-x-4 mb-4">
                                    <select
                                        value={selectedAuthorId || ""}
                                        onChange={(e) => setSelectedAuthorId(Number(e.target.value) || null)}
                                        className="input flex-1"
                                    >
                                        <option value="">Yazar Seçin</option>
                                        {allAuthors.filter(author => !selectedAuthors.find(sa => sa.id === author.id)).map(author => (
                                            <option key={author.id} value={author.id!}>{author.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addAuthor}
                                        className="button px-6 hover:scale-105"
                                        disabled={!selectedAuthorId}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                {/* Seçili Yazarlar */}
                                <div className="flex flex-wrap gap-2">
                                    {selectedAuthors.map(author => (
                                        <div key={author.id} className="flex items-center bg-violet-100 text-violet-800 px-3 py-2 rounded-lg border border-violet-200">
                                            <span className="mr-2 font-medium">{author.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeAuthor(author.id)}
                                                className="text-red-500 hover:text-red-700 hover:scale-110 transition-all duration-200"
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Kategoriler */}
                            <div className="flex flex-col w-full">
                                <label className="font-bold text-gray-500 text-base mb-4">Kategoriler</label>
                                <div className="flex gap-x-4 mb-4">
                                    <select
                                        value={selectedCategoryId || ""}
                                        onChange={(e) => setSelectedCategoryId(Number(e.target.value) || null)}
                                        className="input flex-1"
                                    >
                                        <option value="">Kategori Seçin</option>
                                        {allCategories.filter(category => !selectedCategories.find(sc => sc.id === category.id)).map(category => (
                                            <option key={category.id} value={category.id!}>{category.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addCategory}
                                        className="button px-6 hover:scale-105"
                                        disabled={!selectedCategoryId}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                {/* Seçili Kategoriler */}
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategories.map(category => (
                                        <div key={category.id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-lg border border-blue-200">
                                            <span className="mr-2 font-medium">{category.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(category.id)}
                                                className="text-red-500 hover:text-red-700 hover:scale-110 transition-all duration-200"
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Etiketler */}
                            <div className="flex flex-col w-full">
                                <label className="font-bold text-gray-500 text-base mb-4">Etiketler</label>
                                <div className="flex gap-x-4 mb-4">
                                    <select
                                        value={selectedTagId || ""}
                                        onChange={(e) => setSelectedTagId(Number(e.target.value) || null)}
                                        className="input flex-1"
                                    >
                                        <option value="">Etiket Seçin</option>
                                        {allTags.filter(tag => !selectedTags.find(st => st.id === tag.id)).map(tag => (
                                            <option key={tag.id} value={tag.id!}>{tag.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="button px-6 hover:scale-105"
                                        disabled={!selectedTagId}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                {/* Seçili Etiketler */}
                                <div className="flex flex-wrap gap-2">
                                    {selectedTags.map(tag => (
                                        <div key={tag.id} className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-lg border border-green-200">
                                            <span className="mr-2 font-medium">{tag.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag.id)}
                                                className="text-red-500 hover:text-red-700 hover:scale-110 transition-all duration-200"
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fotoğraf Yönetimi */}
                            <div className="flex flex-col w-full">
                                <label className="font-bold text-gray-500 text-base mb-4">Fotoğraflar</label>

                                {/* Yeni Fotoğraf Yükleme */}
                                <div className="mb-6">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="imageUpload"
                                    />
                                    <label
                                        htmlFor="imageUpload"
                                        className="button inline-flex items-center cursor-pointer hover:scale-105"
                                    >
                                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                        Fotoğraf Ekle
                                    </label>
                                </div>

                                {/* Mevcut Fotoğraflar */}
                                {existingImages.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-600 mb-3">Mevcut Fotoğraflar</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            {existingImages.map(image => (
                                                <div key={image.id} className="relative group">
                                                    <img
                                                        src={image.imageUrl || '/placeholder.jpg'}
                                                        alt={image.caption || 'Kitap fotoğrafı'}
                                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(image.id)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Yeni Eklenen Fotoğraflar */}
                                {newImages.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-600 mb-3">Yeni Fotoğraflar</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`Yeni fotoğraf ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row mt-10 gap-x-4 px-20">
                                <button type="submit" className="button w-1/2 font-bold text-lg !py-4 hover:scale-105 duration-300">
                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    Onayla
                                </button>
                                <Link to="/admin/books" className="button w-1/2 !bg-red-500 font-bold !py-4 text-center text-lg hover:scale-105 duration-300">
                                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                    Geri Dön
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            }
        </>
    )
}