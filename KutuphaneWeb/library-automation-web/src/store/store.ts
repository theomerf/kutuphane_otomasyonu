import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { accountSlice } from "../pages/Account/accountSlice";
import { cartSlice } from "../pages/Cart/cartSlice";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

const rootReducer = combineReducers({
    account: accountSlice.reducer,
    cart: cartSlice.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
});
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;