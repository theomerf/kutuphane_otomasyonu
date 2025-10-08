import { toast } from "react-toastify";
import requests from "../../services/api";
import type { ApiErrorResponse, FormError } from "../../types/apiError";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type FavoritesState = {
    favorites: number[] | null;
    status: string;
    error?: FormError | null;
}

const initialState: FavoritesState = {
    favorites: null,
    status: "idle",
    error: null,
};

export const addToFavorites = createAsyncThunk(
    "favorites/add",
    async (bookId: number, thunkAPI) => {
        try {
            await requests.account.addToFavorites(bookId);
            toast.success("Kitap favorilere eklendi.");
            return bookId;
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue({
                message: "Favorilere ekleme işlemi sırasında bir hata oluştu.",
                errors: {}
            } as ApiErrorResponse);
        }
    }
)

export const removeFromFavorites = createAsyncThunk(
    "favorites/remove",
    async (bookId: number, thunkAPI) => {
        try {
            await requests.account.removeFromFavorites(bookId);
            toast.success("Kitap favorilerden çıkarıldı.");
            return bookId;
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue({
                message: "Favorilerden çıkarma işlemi sırasında bir hata oluştu.",
                errors: {}
            } as ApiErrorResponse);
        }
    }
)

export const fetchFavorites = createAsyncThunk(
    "favorites/fetch",
    async (_, thunkAPI) => {
        try {
            var response = await requests.account.getFavorites();
            return response.data;
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue({
                message: "Favorileri getirme işlemi sırasında bir hata oluştu.",
                errors: {}
            } as ApiErrorResponse);
        }
    }
)

export const favoritesSlice = createSlice(
    {
        name: "favorites",
        initialState,
        reducers: {
            setFavorites(state, action) {
                state.favorites = action.payload;
            },
            clearFavorites(state) {
                state.favorites = null;
                localStorage.removeItem("favorites");
                state.status = "idle";
                state.error = null;
            }
        },
        extraReducers: (builder) => {
            builder.addCase(addToFavorites.pending, (state) => {
                state.status = "pending";
                state.error = null;
            });
            builder.addCase(addToFavorites.fulfilled, (state, action) => {
                if (state.favorites) {
                    state.favorites.push(action.payload);
                } else {
                    state.favorites = [action.payload];
                }
                localStorage.setItem("favorites", JSON.stringify(state.favorites));
                state.status = "idle";
            });
            builder.addCase(addToFavorites.rejected, (state, action) => {
                state.status = "idle";
                state.error = action.payload as FormError;
            });

            builder.addCase(removeFromFavorites.pending, (state) => {
                state.status = "pending";
                state.error = null;
            });
            builder.addCase(removeFromFavorites.fulfilled, (state, action) => {
                if (state.favorites) {
                    state.favorites = state.favorites.filter(id => id !== action.payload);
                }
                localStorage.setItem("favorites", JSON.stringify(state.favorites));
                state.status = "idle";
            });
            builder.addCase(removeFromFavorites.rejected, (state, action) => {
                state.status = "idle";
                state.error = action.payload as FormError;
            });

            builder.addCase(fetchFavorites.pending, (state) => {
                state.status = "pending";
                state.error = null;
            });
            builder.addCase(fetchFavorites.fulfilled, (state, action) => {
                state.favorites = action.payload.favoriteBookIds;
                localStorage.setItem("favorites", JSON.stringify(state.favorites));
                state.status = "idle";
            });
            builder.addCase(fetchFavorites.rejected, (state, action) => {
                state.status = "idle";
                state.error = action.payload as FormError;
            });
        }
    }
)

export const { setFavorites, clearFavorites } = favoritesSlice.actions;