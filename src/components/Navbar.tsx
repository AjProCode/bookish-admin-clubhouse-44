
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, User, BookOpen, BookText } from 'lucide-react';

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg className="h-8 w-8 text-bookclub-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span className="text-xl font-serif font-bold text-gray-800">SkillBag Book Club</span>
        </Link>

        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/" className="w-full">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/books" className="w-full">Browse Books</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/bookshelf" className="w-full">My Bookshelf</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/reading-log" className="w-full">Reading Log</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin" className="w-full">Admin</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/login" className="w-full">Login</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-bookclub-primary transition-colors">Home</Link>
            <Link to="/books" className="text-gray-700 hover:text-bookclub-primary transition-colors">Browse Books</Link>
            <Link to="/bookshelf" className="text-gray-700 hover:text-bookclub-primary transition-colors">My Bookshelf</Link>
            <Link to="/reading-log" className="text-gray-700 hover:text-bookclub-primary transition-colors">Reading Log</Link>
            <Link to="/admin" className="text-gray-700 hover:text-bookclub-primary transition-colors">Admin</Link>
            <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
              <Link to="/login">
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
