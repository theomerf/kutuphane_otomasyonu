import axios from 'axios';
import type { LoginResponse } from '../types/loginResponse';
import { toast } from 'react-toastify';
import { history } from './history';
import { store } from '../store/store';
import { logout, setUser } from '../pages/Account/accountSlice';
import type { CartLine } from '../types/cartResponse';
import type CartResponse from '../types/cartResponse';

axios.defaults.baseURL = "https://localhost:7214/api/";

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
        if (!error.response) {
            toast.error("Sunucuya ulaşılamıyor");
            return Promise.reject(error);
        }

        const { data, status } = error.response;

        switch (status) {
            case 401:
                if(!error.config._retry) {
                    error.config._retry = true;
                }
                const user = store.getState().account.user; 
                if (user) {
                    try{
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
                    catch (refreshError){
                        store.dispatch(logout());
                        return Promise.reject(refreshError);
                    }

                }
                return Promise.reject(error);
            case 400:
            case 403:
                toast.error(data?.message ?? "Yetkisiz erişim");
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
        return Promise.reject(error.message);
    }
);

const methods = {
    get: (url: string, params?: any, signal?: AbortSignal) => axios.get(url, {...params, signal}).then((response) => ({data: response.data, headers: response.headers})),
    getWithoutHeaders: (url: string, params?: any, signal?: AbortSignal) => axios.get(url, {...params, signal}).then((response) => response.data),
    post: (url: string, body: any | null) => axios.post(url, body).then((response) => response.data),
    put: (url: string, body: any) => axios.put(url, body).then((response) => response.data),
    patch: (url: string, body: any) => axios.patch(url, body).then((response) => response.data),
    delete: (url: string) => axios.delete(url).then((response) => response.data),
}

const books = {
    getAllBooks: (query: URLSearchParams, signal?: AbortSignal) => methods.get("books", { params: query }, signal),
    getOneBook: (id: string, signal?: AbortSignal) => methods.get(`books/${id}`, {}, signal)
}

const categories = {
    getAllCategories: (signal?: AbortSignal) => methods.get("categories", {}, signal),
    getPopularCategories: (signal?: AbortSignal) => methods.get("categories/popular", {}, signal),
}

const authors = {
    getAllAuthors: (signal?: AbortSignal) => methods.get("authors", {}, signal),
    getPopularAuthors: (signal?: AbortSignal) => methods.get("authors/popular", {}, signal),
}

const cart = {
    getCart: () => methods.getWithoutHeaders("cart", {}),
    mergeCarts: (cartDto:CartResponse) => methods.post("cart/merge", cartDto),
    addLineToCart: (cartLineDto: CartLine) => methods.post("cart/addline", cartLineDto),
    removeLineFromCart: (cartLineId: number) => methods.delete(`cart/removeline/${cartLineId}`),
    clearCart: () => methods.delete("cart/clear"),
    increaseQuantity: (cartLineId: number, cartDto: { quantity: number }) => methods.patch(`cart/increase/${cartLineId}`, cartDto),
    decreaseQuantity: (cartLineId: number, cartDto: { quantity: number }) => methods.patch(`cart/decrease/${cartLineId}`, cartDto),
}

const account = {
    login: (formData: any) => methods.post("account/login", formData),
    register: (formData: any) => methods.post("account/register", formData),
    getUser: (userName: string) => methods.get(`account/${userName}`),
    refresh: (user: LoginResponse) => methods.post("account/refresh", user)
}

const errors = {
    get400Error: () => methods.get("errors/bad-request"),
    get401Error: () => methods.get("errors/unauthorized"),
    get403Error: () => methods.get("errors/validation-error"),
    get404Error: () => methods.get("errors/not-found"),
    get500Error: () => methods.get("errors/server-error"),
}

const requests = {
    books,
    account,
    categories,
    authors,
    cart,
    errors
}

export default requests;