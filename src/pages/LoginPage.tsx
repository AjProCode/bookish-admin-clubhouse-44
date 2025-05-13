
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        // Redirect to bookshelf if already logged in
        navigate('/bookshelf');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) {
        setLoginError(error.message);
        setIsSubmitting(false);
        return;
      }
      
      if (data.user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.email}!`,
        });
        
        // Check for admin role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (!profileError && profileData?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/bookshelf');
        }
      }
    } catch (error: any) {
      setLoginError(error.message || 'An error occurred during login');
      setIsSubmitting(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError('');
    
    // Validate form
    if (!firstName || !lastName || !registerEmail || !registerPassword || !confirmPassword) {
      setRegistrationError('All fields are required');
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setRegistrationError('Passwords do not match');
      return;
    }
    
    if (!agreeToTerms) {
      setRegistrationError('You must agree to the terms of service');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create new user
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });
      
      if (error) {
        setRegistrationError(error.message);
        setIsSubmitting(false);
        return;
      }
      
      if (data.user) {
        // Create a profile record for the user using RPC to avoid type issues
        const { error: insertError } = await supabase.rpc('create_profile', {
          user_id: data.user.id,
          user_email: registerEmail,
          user_first_name: firstName,
          user_last_name: lastName
        });
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
        }
        
        toast({
          title: "Registration successful",
          description: "Your account has been created. Please check your email for verification link.",
        });
        
        navigate('/membership');
      }
    } catch (error: any) {
      setRegistrationError(error.message || 'An error occurred during registration');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <Link to="/" className="absolute top-4 left-4 text-indigo-600 hover:text-indigo-800 transition-colors">
        ← Back to Home
      </Link>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/645f9f6e-de35-4451-8744-d12fc8979b30.png" 
              alt="Skillbag Logo" 
              className="h-12 mx-auto" 
            />
          </div>
          <h1 className="text-2xl font-bold text-indigo-800">Welcome to Skillbag!</h1>
          <p className="text-indigo-600">Sign in to access your account or join us.</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" data-value="login" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border border-indigo-200 shadow-lg">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle className="text-indigo-800">Login</CardTitle>
                  <CardDescription className="text-indigo-600">
                    Enter your credentials to access your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                      {loginError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-indigo-700">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      required 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-indigo-700">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="text-indigo-500" />
                    <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-indigo-700">
                      Remember me
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="border border-indigo-200 shadow-lg">
              <form onSubmit={handleRegister}>
                <CardHeader>
                  <CardTitle className="text-indigo-800">Create Account</CardTitle>
                  <CardDescription className="text-indigo-600">
                    Join our book club community today.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registrationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                      {registrationError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-indigo-700">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John" 
                        required 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-indigo-700">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe" 
                        required 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register" className="text-indigo-700">Email</Label>
                    <Input 
                      id="email-register" 
                      type="email" 
                      placeholder="your@email.com" 
                      required 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register" className="text-indigo-700">Password</Label>
                    <Input 
                      id="password-register" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-indigo-700">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      required 
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      className="text-indigo-500"
                    />
                    <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-indigo-700">
                      I agree to the <Link to="/terms" className="text-indigo-600 hover:underline">terms of service</Link> and <Link to="/privacy" className="text-indigo-600 hover:underline">privacy policy</Link>
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
