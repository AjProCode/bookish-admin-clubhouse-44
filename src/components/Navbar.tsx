
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/645f9f6e-de35-4451-8744-d12fc8979b30.png" 
            alt="Skillbag Logo" 
            className="h-8 transparent-bg"
          />
        </Link>

        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-700">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200">
              <DropdownMenuItem asChild>
                <Link to="/" className="w-full hover:text-gray-900">Home</Link>
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/books" className="w-full hover:text-gray-900">Browse Books</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/bookshelf" className="w-full hover:text-gray-900">My Bookshelf</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reading-log" className="w-full hover:text-gray-900">Reading Log</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full hover:text-gray-900">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </span>
                  </DropdownMenuItem>
                </>
              )}
              {!user && (
                <DropdownMenuItem asChild>
                  <Link to="/login" className="w-full hover:text-gray-900">Login</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">Home</Link>
            {user ? (
              <>
                <Link to="/books" className="text-gray-700 hover:text-gray-900 transition-colors">Browse Books</Link>
                <Link to="/bookshelf" className="text-gray-700 hover:text-gray-900 transition-colors">My Bookshelf</Link>
                <Link to="/reading-log" className="text-gray-700 hover:text-gray-900 transition-colors">Reading Log</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-gray-900 transition-colors">Admin</Link>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 border-gray-500 text-gray-700 hover:bg-gray-50 cursor-pointer" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="flex items-center gap-2 border-gray-500 text-gray-700 hover:bg-gray-50" asChild>
                <Link to="/login">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
