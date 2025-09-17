import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { store } from './store/store.ts'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')!).render(
  //<StrictMode>
    <>
    <ToastContainer position="bottom-right" theme='colored' autoClose={3000} />
    <Provider store={store}>
      <App />
    </Provider>
    </>
  //</StrictMode>
)
