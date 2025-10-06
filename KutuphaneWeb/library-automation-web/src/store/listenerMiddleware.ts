import { createListenerMiddleware } from "@reduxjs/toolkit";
import { loginUser } from "../pages/Account/accountSlice";
import { fetchFavorites } from "../pages/Favorites/favoritesSlice";

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: loginUser.fulfilled,
  effect: async (action, listenerApi) => {
    const user = action.payload;

    if (user.accessToken) {
      listenerApi.dispatch(fetchFavorites());
    }
  },
});

export default listenerMiddleware;
