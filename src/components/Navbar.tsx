
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, userProfile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
            BookClub
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link 
              to="/books" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Books
            </Link>
            {user && (
              <>
                <Link 
                  to="/bookshelf" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  My Bookshelf
                </Link>
                <Link 
                  to="/reading-log" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Reading Log
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="outline" asChild className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Link to="/admin">Admin Panel</Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                      {userProfile?.name || user.email}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-gray-500">
                      {user.email}
                    </div>
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
