import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { LoginResponse } from '../../types/loginResponse';
import { toast } from 'react-toastify'
import requests from '../../services/api';
import { history } from '../../services/history';

type userState = {
    user: LoginResponse | null;
    status: string;
    error?: string | null;
}

const initialState: userState = {
    user: null,
    status: "idle",
    error: null,
};

export const loginUser = createAsyncThunk(
    "account/login",
    async (data, thunkAPI) => {
        try{
            const result = await requests.account.login(data);
            localStorage.setItem("user", JSON.stringify(result));
            toast.success("Başarıyla giriş yaptınız.");
            history.push("/");
            return result;
        }
        catch(error: any){
            if (error.response?.status === 401) {
                return thunkAPI.rejectWithValue("Kullanıcı adı veya şifre yanlış.");
            }
            thunkAPI.rejectWithValue({ error });
        }
    }
)

export const registerUser = createAsyncThunk(
    "account/register",
    async (data, thunkAPI) => {
        try{
            var result = await requests.account.login(data);
            toast.success("Başarıyla kayıt oldunuz, lütfen giriş yapın.");
            history.push("/account/login");
            return result;
        }
        catch(error){
            thunkAPI.rejectWithValue({ error });
        }
    }
)

export const refresh = createAsyncThunk(
    "account/refresh",
    async (data: LoginResponse, thunkAPI) => {
        const storedUser = localStorage.getItem("user");

        const user: LoginResponse | null = storedUser ? JSON.parse(storedUser) as LoginResponse : null;
        if (user) thunkAPI.dispatch(setUser(user));
        try{
            var result = await requests.account.refresh(data);
            const newUser = result.data;

            const updatedUser = newUser;
            localStorage.setItem("user", JSON.stringify(updatedUser));

            return result;
        }
        catch(error){
            thunkAPI.rejectWithValue({ error });
        }
    }
)

export const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
            toast.success("Başarıyla çıkış yaptınız.");
            localStorage.removeItem("user");
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.user = action.payload;
            state.status = "idle";
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as string;
        });

        builder.addCase(registerUser.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(registerUser.fulfilled, (state) => {
            state.status = "idle";
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as string;
        });

        builder.addCase(refresh.fulfilled, (state, action) => {
            state.user = action.payload;
        });
        builder.addCase(refresh.rejected, (state) => {
            state.user = null;
            localStorage.removeItem("user");
            history.push("/login");
        });
    }
});

export const { setUser, logout } = accountSlice.actions;

