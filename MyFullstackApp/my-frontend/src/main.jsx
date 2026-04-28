import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './Pages/Home.jsx'
import Quiz from './Pages/Quiz.jsx'
import NotFound from './Pages/NotFound.jsx'
import List from './Pages/List.jsx'
import Test from './Pages/List2.jsx'
import Form from './Pages/Form.jsx'
import Edit from './Pages/Edit.jsx'
import ShowLog from './Pages/ShowLog.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


const URL = import.meta.env.VITE_URL_PRODUCTION || 'https://localhost:5066';
const URL_Express = import.meta.env.VITE_URL_EXPRESS || 'http://localhost:8888';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Layout chung (chứa Header/Footer)
    errorElement: <NotFound />, // Trang hiện ra khi có lỗi hoặc sai đường dẫn
    children: [
      {
        path: "/", // Trang chủ: localhost:5173/
        element: <Home url={{ urlASP: URL, urlExpress: URL_Express }} />,
      },
      {
        path: "quiz/:id", // Trang chi tiết: localhost:5173/quiz/1
        element: <Quiz />,
      },
      {
        path: "list/", // Trang chi tiết: localhost:5173/list
        element: <List url={{ urlASP: URL, urlExpress: URL_Express }} />,
      },
      {
        path: "test/", // Trang chi tiết: localhost:5173/list
        element: <Test url={{ urlASP: URL, urlExpress: URL_Express }} />,
      },
      {
        path: "form/", // Trang chi tiết: localhost:5173/list
        element: <Form url={{ urlASP: URL, urlExpress: URL_Express }} />,
      },
      {
        path: "edit/", // Trang chi tiết: localhost:5173/list
        element: <Edit url={{ urlASP: URL, urlExpress: URL_Express }} />,
      },
      {
        path: "log/", // Trang chi tiết: localhost:5173/log
        element: <ShowLog />,
      }
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
