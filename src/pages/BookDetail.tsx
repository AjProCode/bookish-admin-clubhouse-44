
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/components/BookCard';

// Sample books data - this would typically come from an API
const books: (Book & { description: string })[] = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Self-Help', 'Productivity'],
    rating: 5,
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.'
  },
  {
    id: '2',
    title: 'Deep Work',
    author: 'Cal Newport',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Productivity', 'Business'],
    rating: 4,
    description: 'Deep work is the ability to focus without distraction on a cognitively demanding task. It\'s a skill that allows you to quickly master complicated information and produce better results in less time. Deep Work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship.'
  },
  {
    id: '3',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    coverImage: 'https://images.unsplash.com/photo-1553729784-e91953dec042?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Finance', 'Psychology'],
    rating: 5,
    description: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. And behavior is hard to teach, even to really smart people. Money—investing, personal finance, and business decisions—is typically taught as a math-based field, where data and formulas tell us exactly what to do. But in the real world people don\'t make financial decisions on a spreadsheet.'
  },
  {
    id: '4',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Psychology', 'Science'],
    rating: 4,
    description: 'In the highly anticipated Thinking, Fast and Slow, Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.'
  },
];

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const book = books.find(b => b.id === id);
  
  if (!book) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Book not found</h2>
            <p className="mb-6">The book you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/books">Browse All Books</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/books">
              ← Back to Books
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Book cover */}
          <div className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="aspect-[2/3] overflow-hidden rounded-md">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={`${book.title} cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-bookclub-accent flex items-center justify-center text-bookclub-primary text-4xl font-bold">
                    {book.title.substring(0, 1)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Book details */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
            
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  className={`w-6 h-6 ${i < book.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-gray-600">({book.rating} out of 5)</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {book.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 mb-4">
                {book.description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1">
                Add to Reading List
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                Share Book
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookDetail;
