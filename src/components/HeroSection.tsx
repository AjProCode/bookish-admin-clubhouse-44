
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-bookclub-accent py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Discover, Read & <span className="text-bookclub-primary">Grow</span>
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Join our community of book lovers and expand your knowledge with our curated collection of books. Find your next favorite read today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild>
                <Link to="/books">Browse Books</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Join Club</Link>
              </Button>
            </div>
          </div>
          
          <div className="hidden md:flex justify-center md:justify-end">
            <div className="relative w-full max-w-md h-80">
              <div className="absolute top-0 right-0 w-4/5 h-full bg-bookclub-primary rounded-lg shadow-lg transform rotate-3"></div>
              <div className="absolute top-5 right-5 w-4/5 h-full bg-bookclub-secondary rounded-lg shadow-lg transform -rotate-3"></div>
              <div className="absolute top-2 right-10 w-4/5 h-full bg-white rounded-lg shadow-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Stack of books" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-16 bg-wave-pattern"></div>
    </div>
  );
};

export default HeroSection;
