import { Routes, Route, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'
import './App.css'
import { history } from './services/history.ts'
import Home from './pages/Home.tsx'
import Books from './pages/Books/Books.tsx'
import { Account } from './pages/Account/Account.tsx'
import Login from './pages/Account/Login.tsx'
import Register from './pages/Account/Register.tsx'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { logout, setUser } from './pages/Account/accountSlice.ts'
import type { LoginResponse } from './types/loginResponse.ts'
import Error from './pages/Error/Error.tsx'
import NotFound from './pages/Error/NotFound.tsx'
import { jwtDecode } from 'jwt-decode'
import MainLayout from './components/layout/MainLayout.tsx'
import type { RootState } from './store/store.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type CartResponse from './types/cartResponse.ts'
import { setCart } from './pages/Cart/cartSlice.ts'

function App() {
  const queryClient = new QueryClient();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.account);

  function isTokenExpired(token: string) {
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    }
    catch (err) {
      return true;
    }

  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCart = localStorage.getItem("cart");

    const cart: CartResponse | null = storedCart ? JSON.parse(storedCart) as CartResponse : null;
    const user: LoginResponse | null = storedUser ? JSON.parse(storedUser) as LoginResponse : null;
    
    dispatch(setCart(cart));
    dispatch(setUser(user));

    const storedUserJson = JSON.parse(storedUser || "null")
    if (storedUserJson) {
      if (isTokenExpired(storedUserJson.accessToken)) {
        dispatch(logout());
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <HistoryRouter history={history}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />}></Route>
          <Route path="/Books" element={<Books />}></Route>
          <Route path="/Account" element={<Account />}>
            {!user &&
              <>
                <Route path="Login" element={<Login />}></Route>
                <Route path="Register" element={<Register />}></Route>
              </>
            }
          </Route>
          <Route path="/Error" element={<Error />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Route>
      </Routes>
    </HistoryRouter>
    </QueryClientProvider>
  )
}

export default App
