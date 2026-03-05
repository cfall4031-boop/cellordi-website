import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app/App.tsx";
import Admin from "./app/components/Admin.tsx";
import BlogListing from "./app/components/BlogListing.tsx";
import BlogArticle from "./app/components/BlogArticle.tsx";
import ServiceDetail from "./app/components/ServiceDetail.tsx";
import NotFound from "./app/components/NotFound.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/services/:slug" element={<ServiceDetail />} />
      <Route path="/blog" element={<BlogListing />} />
      <Route path="/blog/:slug" element={<BlogArticle />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/*" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
