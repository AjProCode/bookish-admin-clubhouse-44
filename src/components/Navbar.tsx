
import React, { useEffect, useState } from 'react';
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
import { Menu, User, BookOpen, BookText, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (session) {
        setUser(session.user);
        
        // Check if user has admin role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (!error && profile?.role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    
    checkUser();
    
    // Listen for auth changes
    const { subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        // Check for admin role when signing in
        const checkAdminRole = async () => {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (!error && profile?.role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        };
        checkAdminRole();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
    navigate('/');
  };
  
  return (
    <header className="bg-gradient-to-r from-purple-100 to-indigo-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/645f9f6e-de35-4451-8744-d12fc8979b30.png" 
            alt="Skillbag Logo" 
            className="h-8"
          />
        </Link>

        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-purple-700">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-purple-200">
              <DropdownMenuItem asChild>
                <Link to="/" className="w-full hover:text-purple-700">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/books" className="w-full hover:text-purple-700">Browse Books</Link>
              </DropdownMenuItem>
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/bookshelf" className="w-full hover:text-purple-700">My Bookshelf</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reading-log" className="w-full hover:text-purple-700">Reading Log</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/membership" className="w-full hover:text-purple-700">Membership</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full hover:text-purple-700">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/login" className="w-full hover:text-purple-700">Login</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-purple-700 hover:text-purple-900 transition-colors">Home</Link>
            <Link to="/books" className="text-purple-700 hover:text-purple-900 transition-colors">Browse Books</Link>
            {user ? (
              <>
                <Link to="/bookshelf" className="text-purple-700 hover:text-purple-900 transition-colors">My Bookshelf</Link>
                <Link to="/reading-log" className="text-purple-700 hover:text-purple-900 transition-colors">Reading Log</Link>
                <Link to="/membership" className="text-purple-700 hover:text-purple-900 transition-colors">Membership</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-purple-700 hover:text-purple-900 transition-colors">Admin</Link>
                )}
                <Button variant="outline" size="sm" className="flex items-center gap-2 border-purple-500 text-purple-700 hover:bg-purple-50" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="flex items-center gap-2 border-purple-500 text-purple-700 hover:bg-purple-50" asChild>
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
