
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface UserState {
  id: string;
  email?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserState | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Admin credentials from environment variables
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email
        });
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser({
          id: session.user.id,
          email: session.user.email
        });
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Check if using admin credentials
      const isAdminLogin = email === adminEmail && password === adminPassword;
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        // Special handling for "Email not confirmed" error
        if (error.message?.includes("Email not confirmed")) {
          // If using admin credentials, try to bypass email confirmation
          if (isAdminLogin) {
            // For admin login, we'll automatically try to sign up again if needed
            const { data: userData, error: signupError } = await supabase.auth.signUp({
              email: adminEmail,
              password: adminPassword,
              options: {
                data: {
                  first_name: "Admin",
                  last_name: "User",
                }
              }
            });
            
            if (signupError) {
              toast({
                title: "Admin login failed",
                description: signupError.message,
                variant: "destructive"
              });
            } else {
              // Try login again after signup
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email: adminEmail,
                password: adminPassword,
              });
              
              if (!retryError) {
                toast({
                  title: "Admin login successful",
                  description: "You have been successfully logged in as admin.",
                });
                const from = location.state?.from?.pathname || '/admin';
                navigate(from);
              } else {
                toast({
                  title: "Admin login failed",
                  description: retryError.message,
                  variant: "destructive"
                });
              }
            }
          } else {
            // For regular users with unconfirmed emails, we'll try to auto-confirm
            toast({
              title: "Login with unconfirmed email",
              description: "Attempting to verify your account automatically...",
            });
            
            // Try login again after a brief pause
            setTimeout(async () => {
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
              });
              
              if (retryError) {
                toast({
                  title: "Login failed",
                  description: "Please check your inbox for the verification email or try again later.",
                  variant: "destructive"
                });
              }
            }, 1500);
          }
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Login successful",
          description: "You have been successfully logged in.",
        });
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: window.location.origin + '/login',
        },
      });
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Attempt immediate login for better UX
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        
        toast({
          title: "Signup successful",
          description: "You've been automatically logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Authentication</CardTitle>
          <CardDescription className="text-center">Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="m@example.com" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <CardFooter>
                <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="m@example.com" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <CardFooter>
                <Button className="w-full" onClick={handleSignup} disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign Up"}
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
