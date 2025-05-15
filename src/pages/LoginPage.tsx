
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

  // Predefined credentials for admin and dummy users
  const adminCredentials = {
    email: 'admin@example.com',
    password: 'adminPassword',
    role: 'admin', // Add role property
  };

  const dummyCredentials = {
    email: 'dummy@example.com',
    password: 'dummyPassword',
    role: 'dummy', // Add role property
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        // Redirect to bookshelf if already logged in
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        if (profileData?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/bookshelf');
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setLoginError('');

    // Check against predefined admin credentials
    if (loginEmail === adminCredentials.email && loginPassword === adminCredentials.password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });

        if (authError) {
          console.error('Supabase sign-in error:', authError);
          setLoginError('Failed to sign in with Supabase.');
          setIsSubmitting(false);
          return;
        }

        // If sign-in is successful, navigate to admin
        toast({
          title: 'Login successful',
          description: 'Logged in as admin.',
        });
        navigate('/admin');
        setIsSubmitting(false);
        return;
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('An unexpected error occurred.');
        setIsSubmitting(false);
        return;
      }
    }

    // Check against predefined dummy credentials
    if (loginEmail === dummyCredentials.email && loginPassword === dummyCredentials.password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });

        if (authError) {
          console.error('Supabase sign-in error:', authError);
          setLoginError('Failed to sign in with Supabase.');
          setIsSubmitting(false);
          return;
        }

        // If sign-in is successful, navigate to dummy user page
        toast({
          title: 'Login successful',
          description: 'Logged in as dummy user.',
        });
        navigate('/bookshelf'); // Or wherever dummy users should go
        setIsSubmitting(false);
        return;
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('An unexpected error occurred.');
        setIsSubmitting(false);
        return;
      }
    }

    // Regular Supabase login
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) {
        console.error('Supabase sign-in error:', authError);
        setLoginError('Invalid credentials.');
        setIsSubmitting(false);
        return;
      }

      // If sign-in is successful, navigate to bookshelf
      toast({
        title: 'Login successful',
        description: 'Logged in successfully.',
      });
      navigate('/bookshelf');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setIsSubmitting(true);
    setRegistrationError('');

    if (registerPassword !== confirmPassword) {
      setRegistrationError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    if (!agreeToTerms) {
      setRegistrationError('Please agree to the terms and conditions.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        console.error('Supabase sign-up error:', authError);
        setRegistrationError(authError.message || 'Failed to sign up.');
        setIsSubmitting(false);
        return;
      }
      
      if (data.user) {
        console.log("Registration successful:", data.user);
        
        // Create a profile record for the user - using the create_profile function
        const { error: profileError } = await supabase.rpc('create_profile', {
          user_id: data.user.id,
          user_email: registerEmail,
          user_first_name: firstName, 
          user_last_name: lastName
        });
        
        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
        
        toast({
          title: "Registration successful",
          description: "Your account has been created. Please check your email for verification link.",
        });
        
        navigate('/membership');
      }
    } catch (error: any) {
      console.error("Exception during registration:", error);
      setRegistrationError(error.message || 'An error occurred during registration');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Login or create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList>
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="m@example.com" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                  </div>
                  {loginError && (
                    <p className="text-red-500">{loginError}</p>
                  )}
                  <Button onClick={handleLogin} disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Don't have an account? <Link to="/register">Register</Link>
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="register">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input id="registerEmail" placeholder="m@example.com" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input id="registerPassword" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(checked === true)} />
                    <Label htmlFor="terms">Agree to terms and conditions</Label>
                  </div>
                  {registrationError && (
                    <p className="text-red-500">{registrationError}</p>
                  )}
                  <Button onClick={handleRegister} disabled={isSubmitting}>
                    {isSubmitting ? "Registering..." : "Register"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
