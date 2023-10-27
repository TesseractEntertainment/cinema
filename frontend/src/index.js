import './socket';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from './components/Layout.tsx';
import { ErrorPage, LandingPage } from './pages';
import CreateBroadcastPage from './pages/CreateBroadcastPage.tsx';
import BroadcastPage, { loader as broadcastLoader } from './pages/BroadcastPage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <Layout title='Tesseract'/>,
        children: [
          { index: true, element: <LandingPage />},
          { path: "broadcast/create", element: <CreateBroadcastPage />},
          { path: "broadcast/:id", element: <BroadcastPage />, loader: broadcastLoader}
        ]
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
