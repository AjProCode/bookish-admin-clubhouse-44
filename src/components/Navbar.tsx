
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
import { Menu, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email?: string;
}

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email
        });
        
        // Check if user has admin role
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (!error && data?.role === 'admin') {
          setIsAdmin(true);
          console.log("Admin role detected for user:", session.user.email);
        }
      }
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      if (event === 'SIGNED_IN' && session) {
        setUser({
          id: session.user.id,
          email: session.user.email
        });
        // Check for admin role when signing in
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (!error && data?.role === 'admin') {
          setIsAdmin(true);
          console.log("Admin role detected for user:", session.user.email);
        } else {
          setIsAdmin(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        console.log("User signed out");
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        toast({
          title: "Logout failed",
          description: "There was an error logging out. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setUser(null);
      setIsAdmin(false);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully."
      });
      navigate('/');
      console.log("User successfully signed out");
    } catch (error) {
      console.error("Exception during logout:", error);
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <header className="bg-gradient-to-r from-indigo-100 to-purple-100 shadow-sm sticky top-0 z-50">
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
              <Button variant="ghost" size="icon" className="text-indigo-700">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-indigo-200">
              <DropdownMenuItem asChild>
                <Link to="/" className="w-full hover:text-indigo-700">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/books" className="w-full hover:text-indigo-700">Browse Books</Link>
              </DropdownMenuItem>
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/bookshelf" className="w-full hover:text-indigo-700">My Bookshelf</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/reading-log" className="w-full hover:text-indigo-700">Reading Log</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/membership" className="w-full hover:text-indigo-700">Membership</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full hover:text-indigo-700">Admin</Link>
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
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/login" className="w-full hover:text-indigo-700">Login</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-indigo-700 hover:text-indigo-900 transition-colors">Home</Link>
            <Link to="/books" className="text-indigo-700 hover:text-indigo-900 transition-colors">Browse Books</Link>
            {user ? (
              <>
                <Link to="/bookshelf" className="text-indigo-700 hover:text-indigo-900 transition-colors">My Bookshelf</Link>
                <Link to="/reading-log" className="text-indigo-700 hover:text-indigo-900 transition-colors">Reading Log</Link>
                <Link to="/membership" className="text-indigo-700 hover:text-indigo-900 transition-colors">Membership</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-indigo-700 hover:text-indigo-900 transition-colors">Admin</Link>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 border-indigo-500 text-indigo-700 hover:bg-indigo-50 cursor-pointer" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="flex items-center gap-2 border-indigo-500 text-indigo-700 hover:bg-indigo-50" asChild>
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
