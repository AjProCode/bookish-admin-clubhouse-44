import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { DayPickerProvider } from "react-day-picker";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Public Pages
import Index from "./pages/Index";
import BooksPage from "./pages/BooksPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import BookshelfPage from "./pages/BookshelfPage";
import ReadingLogPage from "./pages/ReadingLogPage";
import BookReviewPage from "./pages/BookReviewPage";
import MembershipPage from "./pages/MembershipPage";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import MembershipPlans from "./pages/admin/MembershipPlans";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DayPickerProvider initialProps={{}}>
        <Router>
          <Toaster />
          <Sonner />
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/bookshelf" element={<BookshelfPage />} />
            <Route path="/reading-log" element={<ReadingLogPage />} />
            <Route path="/book-review/:bookId" element={<BookReviewPage />} />
            <Route path="/membership" element={<MembershipPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="membership-plans" element={<MembershipPlans />} />
            </Route>

            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </Router>
      </DayPickerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
