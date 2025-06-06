
import React from 'react';
import BookCard, { Book } from './BookCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Empty featured books array
const featuredBooks: Book[] = [];

const FeaturedBooks: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Books</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/books">View All</Link>
          </Button>
        </div>
        
        {featuredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500 mb-6">No featured books available at the moment</p>
            <Button asChild>
              <Link to="/admin/books">Add Books</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedBooks;
