import axios from 'axios';
import { toast } from 'react-toastify';
import { history } from '../services/history';
import { store } from '../store/store';
import { logout, setUser } from '../pages/Account/accountSlice';
import requests from '../services/api';

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

export default requests;