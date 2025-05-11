
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import BooksPage from "./pages/BooksPage";
import BookDetail from "./pages/BookDetail";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/review" element={<BookReviewPage />} />
          <Route path="/bookshelf" element={<BookshelfPage />} />
          <Route path="/reading-log" element={<ReadingLogPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="membership-plans" element={<MembershipPlans />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
