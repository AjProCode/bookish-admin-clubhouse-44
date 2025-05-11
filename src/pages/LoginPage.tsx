
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { UserDetails, UserStatus } from '@/models/UserBook';

// Mock user data - in a real app, this would come from an API/backend
// This will be replaced with Supabase authentication once connected
const mockUsers: UserDetails[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@skillbag.com',
    joinDate: new Date().toLocaleDateString(),
    role: 'admin',
    status: 'active',
    booksRead: 5,
    userBooks: []
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    joinDate: new Date().toLocaleDateString(),
    role: 'member',
    status: 'active',
    booksRead: 3,
    userBooks: []
  }
];

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    
    // In a real application, this would be an API call to validate credentials
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === loginEmail);
      
      if (user && loginPassword === 'password') { // Simple mock password check
        if (user.status === 'inactive') {
          setLoginError('Your account has been deactivated. Please contact support.');
          setIsSubmitting(false);
          return;
        }
        
        // Store user in localStorage (in a real app, you'd store JWT tokens)
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/bookshelf');
        }
      } else {
        setLoginError('Invalid email or password');
        setIsSubmitting(false);
      }
    }, 1000);
  };
  
  const handleRegister = (e: React.FormEvent) => {
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
    
    // Check if email already exists
    const emailExists = mockUsers.some(user => user.email === registerEmail);
    if (emailExists) {
      setRegistrationError('An account with this email already exists');
      setIsSubmitting(false);
      return;
    }
    
    // In a real application, this would be an API call to create the user
    setTimeout(() => {
      // Create new user
      const newUser: UserDetails = {
        id: (mockUsers.length + 1).toString(),
        name: `${firstName} ${lastName}`,
        email: registerEmail,
        joinDate: new Date().toLocaleDateString(),
        role: 'member',
        status: 'active' as UserStatus,
        booksRead: 0,
        userBooks: []
      };
      
      // Add to mock users (in a real app, this would be saved to a database)
      mockUsers.push(newUser);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });
      
      // Reset form
      setFirstName('');
      setLastName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setAgreeToTerms(false);
      setIsSubmitting(false);
      
      // Switch to login tab
      document.querySelector('[data-value="login"]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-bookclub-accent p-4">
      <Link to="/" className="absolute top-4 left-4 text-bookclub-primary hover:text-bookclub-primary/80 transition-colors">
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
          <h1 className="text-2xl font-bold">Welcome to Skillbag!</h1>
          <p className="text-gray-600">Sign in to access your account or join us.</p>
          <div className="mt-2 text-sm text-gray-500">
            <p>Admin login: admin@skillbag.com / password</p>
            <p>User login: user@example.com / password</p>
          </div>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" data-value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
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
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      required 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-bookclub-primary hover:underline">
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
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Remember me
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <form onSubmit={handleRegister}>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
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
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John" 
                        required 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe" 
                        required 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input 
                      id="email-register" 
                      type="email" 
                      placeholder="your@email.com" 
                      required 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Password</Label>
                    <Input 
                      id="password-register" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      required 
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the <Link to="/terms" className="text-bookclub-primary hover:underline">terms of service</Link> and <Link to="/privacy" className="text-bookclub-primary hover:underline">privacy policy</Link>
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
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
