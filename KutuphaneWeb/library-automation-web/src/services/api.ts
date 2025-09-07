import axios from 'axios';
import type { LoginResponse } from '../types/loginResponse';
import { toast } from 'react-toastify';
import { history } from './history';
import { store } from '../store/store';
import { logout, setUser } from '../pages/Account/accountSlice';

axios.defaults.baseURL = "https://localhost:7214/";

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
                store.dispatch(logout());
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
    get: (url: string) => axios.get(url).then((response) => response.data),
    post: (url: string, body: any | null) => axios.post(url, body).then((response) => response.data),
    put: (url: string, body: any) => axios.put(url, body).then((response) => response.data),
    delete: (url: string) => axios.delete(url).then((response) => response.data),
}

const books = {
    list: () => methods.get("books"),
    details: (id: number) => methods.get(`books/${id}`)
}

const account = {
    login: (formData: any) => methods.post("api/account/login", formData),
    register: (formData: any) => methods.post("api/account/register", formData),
    getUser: () => methods.post("api/account/", null),
    refresh: (user: LoginResponse) => methods.post("api/account/refresh", user)
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
    errors
}

export default requests;