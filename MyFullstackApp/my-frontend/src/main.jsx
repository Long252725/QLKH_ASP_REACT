import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './Pages/Home.jsx'
import Quiz from './Pages/Quiz.jsx'
import NotFound from './Pages/NotFound.jsx'
import List from './Pages/List.jsx'
import Form from './Pages/Form.jsx'
import Edit from './Pages/Edit.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


const URL = import.meta.env.VITE_URL_PRODUCTION || 'https://localhost:5066';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Layout chung (chứa Header/Footer)
    errorElement: <NotFound />, // Trang hiện ra khi có lỗi hoặc sai đường dẫn
    children: [
      {
        path: "/", // Trang chủ: localhost:5173/
        element: <Home url={URL} />,
      },
      {
        path: "quiz/:id", // Trang chi tiết: localhost:5173/quiz/1
        element: <Quiz />,
      },
      {
        path: "list/", // Trang chi tiết: localhost:5173/list
        element: <List url={URL} />,
      },
      {
        path: "form/", // Trang chi tiết: localhost:5173/list
        element: <Form url={URL} />,
      },
      {
        path: "edit/", // Trang chi tiết: localhost:5173/list
        element: <Edit url={URL} />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
