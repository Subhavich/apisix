import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home.jsx";
import App from "./App.jsx";
import "./index.css";
import Routes from "../pages/Routes.jsx";
import Upstreams from "../pages/Upstreams.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // layout component
    children: [
      { index: true, element: <Home /> },
      { path: "routes", element: <Routes /> },
      { path: "upstreams", element: <Upstreams /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
