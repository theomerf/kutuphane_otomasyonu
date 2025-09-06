import axios from 'axios';
import type { LoginResponse } from '../types/loginResponse';

axios.defaults.baseURL = "https://localhost:7214/";

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