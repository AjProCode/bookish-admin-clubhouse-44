
import React, { useState } from 'react';
import { Book } from '@/components/BookCard';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const BookshelfPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample data - in a real app, this would come from your backend/API
  const myBooks: Book[] = [
    {
      id: '1',
      title: 'Atomic Habits',
      author: 'James Clear',
      coverimage: 'https://via.placeholder.com/300x400?text=Atomic+Habits',
      categories: ['Self-Help', 'Psychology'],
      rating: 5,
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones'
    },
    {
      id: '2',
      title: 'Deep Work',
      author: 'Cal Newport',
      coverimage: 'https://via.placeholder.com/300x400?text=Deep+Work',
      categories: ['Productivity', 'Business'],
      rating: 4,
      description: 'Rules for Focused Success in a Distracted World'
    },
    {
      id: '3',
      title: 'The Lean Startup',
      author: 'Eric Ries',
      coverimage: 'https://via.placeholder.com/300x400?text=The+Lean+Startup',
      categories: ['Business', 'Entrepreneurship'],
      rating: 4,
      description: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses'
    }
  ];

  const getBookCount = (status: string) => {
    if (status === 'all') return myBooks.length;
    // In a real app, you'd filter based on reading status
    return Math.floor(myBooks.length / 3);
  };

  const filteredBooks = filterStatus === 'all' ? myBooks : myBooks.slice(0, 1);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Bookshelf</h1>
            <p className="text-gray-600">Track your reading journey and manage your book collection</p>
          </div>

          {/* Reading Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Books</h3>
              <p className="text-3xl font-bold text-bookclub-primary">{myBooks.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Currently Reading</h3>
              <p className="text-3xl font-bold text-blue-600">{getBookCount('reading')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{getBookCount('completed')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Want to Read</h3>
              <p className="text-3xl font-bold text-orange-600">{getBookCount('want_to_read')}</p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <Badge variant={filterStatus === 'all' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setFilterStatus('all')}>
                All ({myBooks.length})
              </Badge>
              <Badge variant={filterStatus === 'reading' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setFilterStatus('reading')}>
                Reading ({getBookCount('reading')})
              </Badge>
              <Badge variant={filterStatus === 'completed' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setFilterStatus('completed')}>
                Completed ({getBookCount('completed')})
              </Badge>
              <Badge variant={filterStatus === 'want_to_read' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setFilterStatus('want_to_read')}>
                Want to Read ({getBookCount('want_to_read')})
              </Badge>
            </div>

            <Select value="newest" onValueChange={() => {}}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Recently Added</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Books Grid */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No books in this category</h3>
              <p className="text-gray-500 mb-6">Start building your library by adding books!</p>
              <Button asChild>
                <Link to="/books">Browse Books</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="group">
                  <BookCard book={book} showRating={true} />
                  <div className="mt-3 space-y-2">
                    <Button asChild size="sm" className="w-full">
                      <Link to={`/book-review/${book.id}`}>Update Progress</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookshelfPage;
