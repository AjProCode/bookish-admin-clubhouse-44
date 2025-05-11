
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
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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
      authListener?.subscription.unsubscribe();
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
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
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/bookshelf" className="w-full">My Bookshelf</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reading-log" className="w-full">Reading Log</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/membership" className="w-full">Membership</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="w-full">
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/login" className="w-full">Login</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-bookclub-primary transition-colors">Home</Link>
            <Link to="/books" className="text-gray-700 hover:text-bookclub-primary transition-colors">Browse Books</Link>
            {user ? (
              <>
                <Link to="/bookshelf" className="text-gray-700 hover:text-bookclub-primary transition-colors">My Bookshelf</Link>
                <Link to="/reading-log" className="text-gray-700 hover:text-bookclub-primary transition-colors">Reading Log</Link>
                <Link to="/membership" className="text-gray-700 hover:text-bookclub-primary transition-colors">Membership</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-bookclub-primary transition-colors">Admin</Link>
                )}
                <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
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
