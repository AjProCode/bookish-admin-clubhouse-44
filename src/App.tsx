
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { DayPickerProvider } from "react-day-picker";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";

// Public Pages
import Index from "./pages/Index";
import BooksPage from "./pages/BooksPage";
import BookDetail from "./pages/BookDetail";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import BookshelfPage from "./pages/BookshelfPage";
import ReadingLogPage from "./pages/ReadingLogPage";
import BookReviewPage from "./pages/BookReviewPage";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

// Layout component to handle common structure with Navbar and Footer
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <DayPickerProvider initialProps={{}}>
          <Router>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes - with Layout */}
              <Route path="/" element={<AppLayout><Index /></AppLayout>} />
              <Route path="/books" element={<AppLayout><BooksPage /></AppLayout>} />
              <Route path="/books/:id" element={<AppLayout><BookDetail /></AppLayout>} />
              <Route path="/bookshelf" element={<AppLayout><BookshelfPage /></AppLayout>} />
              <Route path="/reading-log" element={<AppLayout><ReadingLogPage /></AppLayout>} />
              <Route path="/book-review/:bookId" element={<AppLayout><BookReviewPage /></AppLayout>} />
              
              {/* Login page - with layout */}
              <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Not Found Route */}
              <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
            </Routes>
          </Router>
        </DayPickerProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
