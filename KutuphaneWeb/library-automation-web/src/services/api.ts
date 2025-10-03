import axios from 'axios';
import type { LoginResponse } from '../types/loginResponse';
import { toast } from 'react-toastify';
import { history } from '../utils/history';
import { store } from '../store/store';
import { logout, setUser } from '../pages/Account/accountSlice';
import type ReservationResponse from '../types/reservation';
import type Loan from '../types/loan';

const apiBase =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
    'https://localhost:7214';

axios.defaults.baseURL = `${apiBase}/api/`;

axios.interceptors.request.use((request) => {
    const token = store.getState().account.user?.accessToken;
    if (token) request.headers["Authorization"] = `Bearer ${token}`;
    return request;
})

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.name === "AbortError" || error.name === "CanceledError" ||
            error.code === "ERR_CANCELED" || error.message?.includes("canceled")) {
            return Promise.reject(error);
        }

        if (!error.response) {
            toast.error("Sunucuya ulaşılamıyor");
            return Promise.reject(error);
        }

        const { data, status } = error.response;

        switch (status) {
            case 401:
                if (!error.config._retry) {
                    error.config._retry = true;
                }
                const user = store.getState().account.user;
                if (user) {
                    try {
                        const res = await requests.account.refresh({
                            accessToken: user.accessToken,
                            refreshToken: user.refreshToken,
                            userName: user.userName,
                        });
                        const newUser = res.data;

                        const updatedUser = newUser;

                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        store.dispatch(setUser(updatedUser));

                        error.config.headers["Authorization"] = `Bearer ${updatedUser.accessToken}`;
                        return axios(error.config);
                    }
                    catch (refreshError) {
                        store.dispatch(logout());
                        return Promise.reject(refreshError);
                    }

                }
                return Promise.reject(error);
            case 422:
            case 400:
            case 403:
                break;
            case 404:
            case 500:
                history.push("/Error", {
                    state: { error: data, status: status },
                });
                toast.error(data?.message ?? "Sunucu hatası");
                break;
            default:
                toast.error("Bilinmeyen hata");
                break;
        }
        return Promise.reject(error);
    }
);

const methods = {
    get: (url: string, params?: any, signal?: AbortSignal) => axios.get(url, { ...params, signal }).then((response) => ({ data: response.data, headers: response.headers })),
    getWithoutHeaders: (url: string, params?: any, signal?: AbortSignal) => axios.get(url, { ...params, signal }).then((response) => response.data),
    post: (url: string, body: any | null, config?: any | null) => axios.post(url, body, config).then((response) => response.data),
    put: (url: string, body: any, config?: any | null) => axios.put(url, body, config).then((response) => response.data),
    patch: (url: string, body: any) => axios.patch(url, body).then((response) => response.data),
    delete: (url: string) => axios.delete(url).then((response) => response.data),
}

const books = {
    getAllBooks: (query: URLSearchParams, signal?: AbortSignal) => methods.get("books", { params: query }, signal),
    getRelatedBooks: (bookId: number, query: URLSearchParams, signal?: AbortSignal) => methods.get(`books/related/${bookId}`, { params: query }, signal),
    getOneBook: (id: string, signal?: AbortSignal) => methods.get(`books/${id}`, {}, signal),
    countBooks: (signal?: AbortSignal) => methods.get("books/count", {}, signal),
    createBook: (formData: FormData) => methods.post("admin/books/create", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateBook: (formData: FormData) => methods.put("admin/books/update", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteBook: (id: number) => methods.delete(`admin/books/delete/${id}`),
}

const categories = {
    getAllCategories: (query: URLSearchParams, signal?: AbortSignal) => methods.get("admin/categories", { params: query }, signal),
    getAllCategoriesWithoutPagination: (signal?: AbortSignal) => methods.get("categories/nopagination", {}, signal),
    getOneCategory: (id: number, signal?: AbortSignal) => methods.get(`categories/${id}`, {}, signal),
    getPopularCategories: (signal?: AbortSignal) => methods.get("categories/popular", {}, signal),
    countCategories: (signal?: AbortSignal) => methods.get("admin/categories/count", {}, signal),
    createCategory: (categoryDto: any) => methods.post("admin/categories/create", categoryDto),
    updateCategory: (categoryDto: any) => methods.put("admin/categories/update", categoryDto),
    deleteCategory: (id: number) => methods.delete(`admin/categories/delete/${id}`),
}

const loan = {
    createLoan: (loanDto: Loan) => methods.post("loan/create", loanDto),
    getAllLoansOfUser: (signal?: AbortSignal) => methods.get("loan/account", {}, signal),
    getAllLoans: (query: URLSearchParams, signal?: AbortSignal) => methods.get("admin/loan", { params: query }, signal),
    getAllLoansCount: (signal?: AbortSignal) => methods.get("admin/loan/count", {}, signal),
    getOneLoan: (id: number, signal?: AbortSignal) => methods.get(`admin/loan/${id}`, {}, signal),
    cancelLoan: (loanId: number) => methods.patch(`admin/loan/cancel/${loanId}`, {}),
    deleteLoan: (id: number) => methods.delete(`admin/loan/delete/${id}`),
    deleteLoanForUser: (id: number) => methods.delete(`loan/delete/${id}`),
    returnLoan: (loanId: number) => methods.patch(`admin/loan/return/${loanId}`, {}),
}

const authors = {
    getAllAuthors: (query: URLSearchParams, signal?: AbortSignal) => methods.get("admin/authors", { params: query }, signal),
    getAllAuthorsWithoutPagination: (signal?: AbortSignal) => methods.get("authors/nopagination", {}, signal),
    getPopularAuthors: (signal?: AbortSignal) => methods.get("authors/popular", {}, signal),
    getOneAuthor: (id: number, signal?: AbortSignal) => methods.get(`authors/${id}`, {}, signal),
    countAuthors: (signal?: AbortSignal) => methods.get("admin/authors/count", {}, signal),
    createAuthor: (authorDto: any) => methods.post("admin/authors/create", authorDto),
    updateAuthor: (authorDto: any) => methods.put("admin/authors/update", authorDto),
    deleteAuthor: (id: number) => methods.delete(`admin/authors/delete/${id}`),
}

const tags = {
    getAllTags: (query: URLSearchParams, signal?: AbortSignal) => methods.get("admin/tags", { params: query }, signal),
    getAllTagsWithoutPagination: (signal?: AbortSignal) => methods.get("tags/nopagination", {}, signal),
    getPopularTags: (signal?: AbortSignal) => methods.get("tags/popular", {}, signal),
    getOneTag: (id: number, signal?: AbortSignal) => methods.get(`tags/${id}`, {}, signal),
    countTags: (signal?: AbortSignal) => methods.get("admin/tags/count", {}, signal),
    createTag: (authorDto: any) => methods.post("admin/tags/create", authorDto),
    updateTag: (authorDto: any) => methods.put("admin/tags/update", authorDto),
    deleteTag: (id: number) => methods.delete(`admin/tags/delete/${id}`),
}

const cart = {
    getCart: () => methods.getWithoutHeaders("cart", {}),
    mergeCarts: (cartDto: any) => methods.post("cart/merge", cartDto),
    addLineToCart: (cartLineDto: any) => methods.post("cart/addline", cartLineDto),
    removeLineFromCart: (cartLineId: number) => methods.delete(`cart/removeline/${cartLineId}`),
    clearCart: () => methods.delete("cart/clear"),
    increaseQuantity: (cartLineId: number, cartDto: { quantity: number }) => methods.patch(`cart/increase/${cartLineId}`, cartDto),
    decreaseQuantity: (cartLineId: number, cartDto: { quantity: number }) => methods.patch(`cart/decrease/${cartLineId}`, cartDto),
}

const seats = {
    getAllSeats: (signal?: AbortSignal) => methods.get("seats", {}, signal),
    getAllSeatsCount: (signal?: AbortSignal) => methods.get("admin/seats/count", {}, signal),
    getOneSeat: (id: number, signal?: AbortSignal) => methods.get(`admin/seats/${id}`, {}, signal),
    createSeat: (seatDto: any) => methods.post("admin/seats/create", seatDto),
    updateSeat: (seatDto: any) => methods.put("admin/seats/update", seatDto),
    deleteSeat: (id: number) => methods.delete(`admin/seats/delete/${id}`),
}

const timeSlots = {
    getAllTimeSlots: (signal?: AbortSignal) => methods.get("seats/timeslots", {}, signal),
    getAllTimeSlotsCount: (signal?: AbortSignal) => methods.get("admin/seats/timeslots/count", {}, signal),
    getOneTimeSlot: (id: number, signal?: AbortSignal) => methods.get(`admin/seats/timeslots/${id}`, {}, signal),
    createTimeSlot: (timeSlotDto: any) => methods.post("admin/seats/timeslots/create", timeSlotDto),
    updateTimeSlot: (timeSlotDto: any) => methods.put("admin/seats/timeslots/update", timeSlotDto),
    deleteTimeSlot: (id: number) => methods.delete(`admin/seats/timeslots/delete/${id}`),
}

const reservation = {
    getAllReservations: (query: URLSearchParams, signal?: AbortSignal) => methods.get("admin/reservation", { params: query }, signal),
    getActiveReservationsCount: (signal?: AbortSignal) => methods.get("admin/reservation/active-count", {}, signal),
    getOneReservation: (id: number, signal?: AbortSignal) => methods.get(`admin/reservation/${id}`, {}, signal),
    getAllReservationsStatuses: (query: URLSearchParams, signal?: AbortSignal) => methods.get("reservation/statuses", { params: query }, signal),
    createReservation: (reservation: ReservationResponse, config?: any) => methods.post(`reservation/reserve-seat`, reservation, config),
    getAllReservationsOfUser: (signal?: AbortSignal) => methods.get("reservation/account", {}, signal),
    cancelReservationForUser: (reservationId: number) => methods.patch(`account/reservation/cancel-reservation/${reservationId}`, {} ),
    cancelReservation: (reservationId: number) => methods.patch(`admin/reservation/cancel-reservation/${reservationId}`, {}),
}

const userReview = {
    getAllUserReviews: (query?: URLSearchParams, signal?: AbortSignal) => methods.get("userreview", { params: query }, signal),
    getOneUserReview: (id: number, signal?: AbortSignal) => methods.get(`userreview/${id}`, {}, signal),
    getUserReviewsByBookId: (bookId: number, signal?: AbortSignal) => methods.get(`userreview/book/${bookId}`, {}, signal),
    getUserReviewsCountByBookId: (bookId: number, signal?: AbortSignal) => methods.get(`userreview/book/${bookId}/count`, {}, signal),
    getAllUserReviewsOfUser: (signal?: AbortSignal) => methods.get("userreview/account", {}, signal),
    createUserReview: (userReviewDto: any) => methods.post("userreview/create", userReviewDto),
    updateUserReview: (userReviewDto: any) => methods.put("userreview/update", userReviewDto),
    deleteUserReview: (id: number) => methods.delete(`userreview/delete/${id}`),
}

const notifications = {
    getAllNotifications: (signal?: AbortSignal) => methods.get("admin/notification", {}, signal),
    getAllNotificationsOfOneUser: (signal?: AbortSignal) => methods.get(`notification/account`, {}, signal),
    getNotificationsCountOfUser: (signal?: AbortSignal) => methods.get(`notification/account/count`, {}, signal),
    markAsRead: (id: number) => methods.patch(`notification/account/mark-as-read/${id}`, {}),
    markAllAsReadOfOneUser: () => methods.patch("notification/account/mark-all-as-read", {}),
    deleteNotification: (id: number) => methods.delete(`admin/notification/delete/${id}`),
    deleteNotificationForUser: (id: number) => methods.delete(`notification/account/delete/${id}`),    
    deleteAllNotificationsOfOneUser: () => methods.delete(`notification/account/delete-all`),
    getOneNotification: (id: number, signal?: AbortSignal) => methods.get(`admin/notification/${id}`, {}, signal),
    createNotification: (notificationDto: any) => methods.post("admin/notification/create", notificationDto),
    updateNotification: (notificationDto: any) => methods.put("admin/notification/update", notificationDto),
}

const account = {
    login: (formData: any) => methods.post("account/login", formData),
    register: (formData: any) => methods.post("account/register", formData),
    getUser: (userName: string) => methods.get(`account/${userName}`),
    refresh: (user: LoginResponse) => methods.post("account/refresh", user),
    getAllAccounts: (query: URLSearchParams, signal?: AbortSignal) => methods.get("admin/accounts", { params: query }, signal),
    countAccounts: (signal?: AbortSignal) => methods.get("admin/accounts/count", {}, signal),
    createAccount: (accountDto: any) => methods.post("admin/accounts/create", accountDto),
    updateAccount: (accountDto: any) => methods.put("admin/accounts/update", accountDto),
    deleteAccount: (id: string) => methods.delete(`admin/accounts/delete/${id}`),
    resetPassword: (resetPasswordDto: any) => methods.post("admin/accounts/reset-password", resetPasswordDto),
    getOneAccount: (id: string, signal?: AbortSignal) => methods.get(`admin/accounts/${id}`, {}, signal),
    getAccountDetails: (signal?: AbortSignal) => methods.get("account/details", {}, signal),
    getAllRoles: (signal?: AbortSignal) => methods.get("admin/accounts/roles", {}, signal),
}

const admin = {
    getAdminDashboard: (signal?: AbortSignal) => methods.get("admin/dashboard", {}, signal),
}

const errors = {
    get400Error: () => methods.get("errors/bad-request"),
    get401Error: () => methods.get("errors/unauthorized"),
    get403Error: () => methods.get("errors/validation-error"),
    get404Error: () => methods.get("errors/not-found"),
    get500Error: () => methods.get("errors/server-error"),
}

const requests = {
    admin,
    userReview,
    books,
    account,
    categories,
    authors,
    tags,
    loan,
    timeSlots,
    cart,
    seats,
    reservation,
    notifications,
    errors
}

export default requests;