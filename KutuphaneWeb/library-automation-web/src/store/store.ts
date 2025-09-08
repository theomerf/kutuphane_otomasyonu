import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { accountSlice } from "../pages/Account/accountSlice";

const rootReducer = combineReducers({
    account: accountSlice.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
});
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;