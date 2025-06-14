
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { DayPickerProvider } from "react-day-picker";
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import UserApprovalGuard from "@/components/UserApprovalGuard";

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

// Protected layout that requires user approval
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <UserApprovalGuard>
    <AppLayout>{children}</AppLayout>
  </UserApprovalGuard>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DayPickerProvider initialProps={{}}>
        <AuthProvider>
          <Router>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes - with Layout */}
              <Route path="/" element={<AppLayout><Index /></AppLayout>} />
              <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
              
              {/* Protected Routes - require approval */}
              <Route path="/books" element={<ProtectedLayout><BooksPage /></ProtectedLayout>} />
              <Route path="/books/:id" element={<ProtectedLayout><BookDetail /></ProtectedLayout>} />
              <Route path="/bookshelf" element={<ProtectedLayout><BookshelfPage /></ProtectedLayout>} />
              <Route path="/reading-log" element={<ProtectedLayout><ReadingLogPage /></ProtectedLayout>} />
              <Route path="/book-review/:bookId" element={<ProtectedLayout><BookReviewPage /></ProtectedLayout>} />

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
        </AuthProvider>
      </DayPickerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
