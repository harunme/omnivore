import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { initializeIcons } from '@fluentui/react/lib/Icons'

import { FluentProvider, teamsLightTheme } from '@fluentui/react-components'
import Layout from './components/MainLayout'
import CenterPage from './routes/Center'
import LoginPage from './routes/Login'
import RssSubscribedPage from './routes/RssSubscribed'
import HomePage from './routes/Home'
import './index.css'

initializeIcons()

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
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/rss',
    element: <Layout />,
    children: [
      {
        path: '/rss',
        element: <RssSubscribedPage />,
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
    <FluentProvider theme={teamsLightTheme}>
      <RouterProvider router={router} />
    </FluentProvider>
  </React.StrictMode>,
)
