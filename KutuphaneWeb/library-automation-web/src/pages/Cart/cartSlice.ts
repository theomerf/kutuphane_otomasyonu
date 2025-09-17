import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../services/api";
import type CartResponse from "../../types/cartResponse";
import type { CartLine } from "../../types/cartResponse";
import { store } from "../../store/store";
import type { ApiErrorResponse, FormError } from "../../types/apiError";

type cartState = {
    cart: CartResponse | null;
    status: string;
    error?: FormError | null;
}

const initialState: cartState = {
    cart: null,
    status: "idle",
    error: null
}

export const getCart = createAsyncThunk<CartResponse>(
    "cart",
    async (_, thunkAPI) => {
        try {
            const result = await requests.cart.getCart();
            localStorage.setItem("cart", JSON.stringify(result));
            return result;
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue("Backendden sepet çekilirken bir hata oluştu.");
        }
    }
)

export const mergeCarts = createAsyncThunk<CartResponse, CartResponse>(
    "cart/merge",
    async (data, thunkAPI) => {
        try {
            const result = await requests.cart.mergeCarts(data);
            localStorage.setItem("cart", JSON.stringify(result));
            return result;
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue("Sepetler birleştirilirken bir hata oluştu.");
        }
    }
)

export const addLineToCart = createAsyncThunk<CartResponse, CartLine>(
    "cart/addLine",
    async (data, thunkAPI) => {
        try {
            if (store.getState().account.user !== null) {
                const result = await requests.cart.addLineToCart(data);
                localStorage.setItem("cart", JSON.stringify(result));
                return result;
            }
            else {
                data.id = Math.floor(Math.random() * 1000000) + 1;
                const localCart = store.getState().cart.cart;
                const updatedCart: CartResponse = {
                    id: localCart ? localCart.id : 0,
                    accountId: localCart ? localCart.accountId : null,
                    cartLines: localCart ? [...localCart.cartLines ?? [], data] : [data],
                };
                localStorage.setItem("cart", JSON.stringify(updatedCart));
                return updatedCart;
            }
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue("Sepete yeni kitap eklenirken bir hata oluştu.");
        }
    }
)

export const removeLineFromCart = createAsyncThunk<CartResponse, number>(
    "cart/removeline",
    async (data, thunkAPI) => {
        try {
            if (store.getState().account.user !== null) {
                const result = await requests.cart.removeLineFromCart(data);
                localStorage.setItem("cart", JSON.stringify(result));
                return result;
            }
            else {
                const localCart = store.getState().cart.cart;
                const updatedCart: CartResponse = {
                    id: localCart ? localCart.id : 0,
                    accountId: localCart ? localCart.accountId : null,
                    cartLines: localCart ? localCart.cartLines?.filter(line => line.id !== data) : [],
                };
                localStorage.setItem("cart", JSON.stringify(updatedCart));
                return updatedCart;
            }
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue("Sepetten kitap silinirken bir hata oluştu.");
        }
    }
)

export const clearCart = createAsyncThunk<CartResponse>(
    "cart/clear",
    async (_, thunkAPI) => {
        try {
            if (store.getState().account.user !== null) {
                const result = await requests.cart.clearCart();
                localStorage.setItem("cart", JSON.stringify(result));
                return result;
            }
            else {
                thunkAPI.dispatch(clearLocalCart());
                return {
                    id: 0,
                    accountId: null,
                    cartLines: []
                };
            }
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue("Sepet temizlenirken bir hata oluştu.");
        }
    }
)

interface QuantityUpdatePayload {
    cartLineId: number;
    quantity: number;
}

export const increaseQuantity = createAsyncThunk<CartLine, QuantityUpdatePayload>(
    "cartlines/increase",
    async (data, thunkAPI) => {
        try {
            if (store.getState().account.user !== null) {
                const result = await requests.cart.increaseQuantity(data.cartLineId, { quantity: data.quantity });
                return result;
            }
            else {
                const localCart = store.getState().cart.cart;
                const line = localCart?.cartLines?.find(line => line.id === data.cartLineId);

                return { ...line, quantity: line!.quantity + data.quantity }; 
            }
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue("Sepetteki kitabın miktarı arttılırken bir hata oluştu.");
        }
    }
)

export const decreaseQuantity = createAsyncThunk<CartLine, QuantityUpdatePayload>(
    "cartlines/decrease",
    async (data, thunkAPI) => {
        try {
            if (store.getState().account.user !== null) {
                const result = await requests.cart.decreaseQuantity(data.cartLineId, { quantity: data.quantity });
                return result;
            }
            else {
                const localCart = store.getState().cart.cart;
                const line = localCart?.cartLines?.find(line => line.id === data.cartLineId);

                return { ...line, quantity: line!.quantity - data.quantity }; 
            }
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue("Sepetteki kitabın miktarı azaltılırken bir hata oluştu.");
        }
    }
)

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCart: (state, action) => {
            state.cart = action.payload;
        },
        clearLocalCart: (state) => {
            state.cart = null;
            localStorage.removeItem("cart");
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getCart.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(getCart.fulfilled, (state, action) => {
            state.cart = action.payload;
            state.status = "idle";
        });
        builder.addCase(getCart.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
            localStorage.removeItem("cart");
        });

        builder.addCase(mergeCarts.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(mergeCarts.fulfilled, (state, action) => {
            state.cart = action.payload;
            state.status = "idle";
        });
        builder.addCase(mergeCarts.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
        });

        builder.addCase(addLineToCart.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(addLineToCart.fulfilled, (state, action) => {
            state.cart = action.payload;
            state.status = "idle";
        });
        builder.addCase(addLineToCart.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
        });

        builder.addCase(removeLineFromCart.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(removeLineFromCart.fulfilled, (state, action) => {
            state.cart = action.payload;
            state.status = "idle";
        });
        builder.addCase(removeLineFromCart.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
        });

        builder.addCase(clearCart.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(clearCart.fulfilled, (state, action) => {
            state.cart = action.payload;
            state.status = "idle";
        });
        builder.addCase(clearCart.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
        });

        builder.addCase(increaseQuantity.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(increaseQuantity.fulfilled, (state, action) => {
            if (!state.cart?.cartLines) return;
            
            const lineIndex = state.cart.cartLines.findIndex(line => line.id === action.payload.id);
            if (lineIndex !== -1) {
                state.cart.cartLines[lineIndex].quantity = action.payload.quantity;
            }

            localStorage.setItem("cart", JSON.stringify(state.cart));
            state.status = "idle";
        });
        builder.addCase(increaseQuantity.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
        });

        builder.addCase(decreaseQuantity.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(decreaseQuantity.fulfilled, (state, action) => {
            if (!state.cart?.cartLines) return;
            
            const lineIndex = state.cart.cartLines.findIndex(line => line.id === action.payload.id);
            if (lineIndex !== -1) {
                state.cart.cartLines[lineIndex].quantity = action.payload.quantity;
            }

            localStorage.setItem("cart", JSON.stringify(state.cart));
            state.status = "idle";
        });
        builder.addCase(decreaseQuantity.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
        });
    }
});

export const { setCart, clearLocalCart } = cartSlice.actions;