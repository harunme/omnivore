import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RssPage from './routes/Discover/Rss'
import WorksPage from './routes/Works'
import Layout from './components/MainLayout'
import CenterPage from './routes/Center'
import LoginPage from './routes/Login'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/discover',
    element: <Layout />,
    children: [
      {
        path: '/discover',
        element: <RssPage />,
      },
    ],
  },
  {
    path: '/works',
    element: <Layout />,
    children: [
      {
        path: '/works',
        element: <WorksPage />,
      },
    ],
  },
  {
    path: '/center',
    element: <Layout />,
    children: [
      {
        path: '/center',
        element: <CenterPage />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
