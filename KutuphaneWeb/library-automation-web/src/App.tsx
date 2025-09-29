import { Routes, Route, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'
import ProtectedRoute from './utils/ProtectedRoute.tsx'
import './App.css'
import { history } from './utils/history.ts'
import Home from './pages/Home.tsx'
import Books from './pages/Books/Books.tsx'
import { Account } from './pages/Account/Account.tsx'
import Login from './pages/Account/Login.tsx'
import Register from './pages/Account/Register.tsx'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { logout, setUser } from './pages/Account/accountSlice.ts'
import type { LoginResponse } from './types/loginResponse.ts'
import Error from './pages/Error/Error.tsx'
import NotFound from './pages/Error/NotFound.tsx'
import { jwtDecode } from 'jwt-decode'
import MainLayout from './components/layout/MainLayout.tsx'
import type { AppDispatch, RootState } from './store/store.ts'
import type CartResponse from './types/cartResponse.ts'
import { setCart } from './pages/Cart/cartSlice.ts'
import Cart from './pages/Cart/Cart.tsx'
import Reservation from './pages/Reservation/Reservation.tsx'
import { BookDetail } from './pages/Books/BookDetail.tsx'
import Checkout from './pages/Checkout/Checkout.tsx'
import AdminLayout from './components/layout/AdminLayout.tsx'
import Dashboard from './pages/Admin/Dashboard/Dashboard.tsx'
import BooksAdmin from './pages/Admin/BooksManagement/Books/BooksAdmin.tsx'
import { UpdateBook } from './pages/Admin/BooksManagement/Books/UpdateBook.tsx'
import { CreateBook } from './pages/Admin/BooksManagement/Books/CreateBook.tsx'
import BooksDashboard from './pages/Admin/BooksManagement/BooksDashboard.tsx'
import CategoriesAdmin from './pages/Admin/BooksManagement/Categories/CategoriesAdmin.tsx'
import { CreateCategory } from './pages/Admin/BooksManagement/Categories/CreateCategory.tsx'
import { UpdateCategory } from './pages/Admin/BooksManagement/Categories/UpdateCategory.tsx'
import AuthorsAdmin from './pages/Admin/BooksManagement/Authors/AuthorsAdmin.tsx'
import { CreateAuthor } from './pages/Admin/BooksManagement/Authors/CreateAuthor.tsx'
import { UpdateAuthor } from './pages/Admin/BooksManagement/Authors/UpdateAuthor.tsx'
import TagsAdmin from './pages/Admin/BooksManagement/Tags/TagsAdmin.tsx'
import { CreateTag } from './pages/Admin/BooksManagement/Tags/CreateTag.tsx'
import { UpdateTag } from './pages/Admin/BooksManagement/Tags/UpdateTag.tsx'
import AccountsAdmin from './pages/Admin/AccountsManagement/Accounts/AccountsAdmin.tsx'
import { CreateAccount } from './pages/Admin/AccountsManagement/Accounts/CreateAccount.tsx'
import { UpdateAccount } from './pages/Admin/AccountsManagement/Accounts/UpdateAccount.tsx'
import Notifications from './pages/Notifications/Notifications.tsx'

function App() {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.account);
  const [isAdmin, setIsAdmin] = useState(false);

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

  function checkRole(token: string, targetRole = "Admin") {
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const roles = decoded["role"] || decoded["roles"] || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (!roles) return false;

      if (Array.isArray(roles)) {
        return roles.includes(targetRole);
      }

      if (typeof roles === "string") {
        return roles === targetRole;
      }

      return false;
    }
    catch (err) {
      return false;
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

  useEffect(() => {
    if (user?.accessToken) {
      setIsAdmin(checkRole(user.accessToken));
    } else {
      setIsAdmin(false);
    }
  }, [user?.accessToken]);

  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<Dashboard />}></Route>
            <Route path="/admin/dashboard/books" element={<BooksDashboard />}></Route>
            <Route path="/admin/books" element={<BooksAdmin />}></Route>
            <Route path="/admin/books/create" element={<CreateBook />}></Route>
            <Route path="/admin/books/update/:id" element={<UpdateBook />}></Route>
            <Route path="/admin/categories" element={<CategoriesAdmin />}></Route>
            <Route path="/admin/categories/create" element={<CreateCategory />}></Route>
            <Route path="/admin/categories/update/:id" element={<UpdateCategory />}></Route>
            <Route path="/admin/authors" element={<AuthorsAdmin />}></Route>
            <Route path="/admin/authors/create" element={<CreateAuthor />}></Route>
            <Route path="/admin/authors/update/:id" element={<UpdateAuthor />}></Route>
            <Route path="/admin/tags" element={<TagsAdmin />}></Route>
            <Route path="/admin/tags/create" element={<CreateTag />}></Route>
            <Route path="/admin/tags/update/:id" element={<UpdateTag />}></Route>
            <Route path="/admin/accounts" element={<AccountsAdmin />}></Route>
            <Route path="/admin/accounts/create" element={<CreateAccount />}></Route>
            <Route path="/admin/accounts/update/:id" element={<UpdateAccount />}></Route>
            <Route path="/admin/*" element={<NotFound />}></Route>
          </Route>
        </Route>
        
        <Route element={<MainLayout isAdmin={isAdmin} />}>
          <Route path="/" element={<Home />} ></Route>
          <Route path="/books" element={<Books />}></Route>
          <Route path="/books/:id" element={<BookDetail />}></Route>
          <Route path="/cart" element={<Cart />}></Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/notifications" element={<Notifications />}></Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />}></Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/reservation" element={<Reservation />}></Route>
          </Route>
          <Route path="/account" element={<Account />}>
            {!user &&
              <>
                <Route path="login" element={<Login />}></Route>
                <Route path="register" element={<Register />}></Route>
              </>
            }
          </Route>
          <Route path="/error" element={<Error />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Route>
      </Routes>
    </HistoryRouter>
  )
}

export default App
