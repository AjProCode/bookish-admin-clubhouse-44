
import React from 'react';
import BookCard, { Book } from './BookCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Sample featured books
const featuredBooks: Book[] = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Self-Help', 'Productivity'],
    rating: 5
  },
  {
    id: '2',
    title: 'Deep Work',
    author: 'Cal Newport',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Productivity', 'Business'],
    rating: 4
  },
  {
    id: '3',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    coverImage: 'https://images.unsplash.com/photo-1553729784-e91953dec042?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Finance', 'Psychology'],
    rating: 5
  },
  {
    id: '4',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Psychology', 'Science'],
    rating: 4
  }
];

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
