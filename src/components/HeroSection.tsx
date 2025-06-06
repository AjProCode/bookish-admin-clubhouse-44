
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HeroSection: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to Skillbag Books
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Discover amazing books, track your reading progress, and join our community of book lovers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/books">Browse Books</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link to="/login">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link to="/books">Explore Books</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
