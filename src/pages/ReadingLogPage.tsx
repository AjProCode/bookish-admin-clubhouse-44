
import React, { useState } from 'react';
import { Book } from '@/components/BookCard';
import { UserBook } from '@/models/UserBook';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Star, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ReadingLogPage: React.FC = () => {
  const [filterYear, setFilterYear] = useState('2023');
  const [sortBy, setSortBy] = useState('newest');

  // Sample data - in a real app, this would come from your backend/API
  const books: Book[] = [
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

  const userBooks: UserBook[] = [
    { 
      id: '101',
      bookId: '1',
      userId: 'user1',
      status: 'completed',
      dateAdded: '2023-01-15',
      dateStarted: '2023-01-20',
      dateFinished: '2023-02-10',
      pagesRead: 320,
      rating: 5,
      notes: 'Finished in 3 weeks. Great concepts about habit formation.',
      review: 'James Clear presents a comprehensive framework for building good habits and breaking bad ones. The concept of 1% improvements daily resonated with me deeply. Highly recommended!',
      isFavorite: true
    },
    { 
      id: '102',
      bookId: '2',
      userId: 'user1',
      status: 'completed',
      dateAdded: '2023-03-05',
      dateStarted: '2023-03-10',
      dateFinished: '2023-04-15',
      pagesRead: 296,
      rating: 4,
      notes: 'Took about 5 weeks to complete. Very practical advice.',
      review: 'Cal Newport makes a compelling case for deep work in our distracted world. The strategies are practical and actionable.',
      isFavorite: false
    },
    { 
      id: '103',
      bookId: '3',
      userId: 'user1',
      status: 'completed',
      dateAdded: '2023-05-01',
      dateStarted: '2023-05-10',
      dateFinished: '2023-06-20',
      pagesRead: 336,
      rating: 4,
      notes: 'Essential reading for entrepreneurs.',
      review: 'Eric Ries provides valuable insights into building successful startups through continuous innovation.',
      isFavorite: false
    }
  ];

  const getBookDetails = (bookId: string) => {
    return books.find(book => book.id === bookId);
  };

  const getReadingStats = () => {
    const completedBooks = userBooks.filter(ub => ub.status === 'completed');
    const totalPages = completedBooks.reduce((sum, ub) => sum + (ub.pagesRead || 0), 0);
    const averageRating = completedBooks.reduce((sum, ub) => sum + (ub.rating || 0), 0) / completedBooks.length;
    
    return {
      booksRead: completedBooks.length,
      totalPages,
      averageRating: Math.round(averageRating * 10) / 10
    };
  };

  const stats = getReadingStats();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Reading Log</h1>
            <p className="text-gray-600">Track your reading progress and maintain a record of all the books you've read</p>
          </div>

          {/* Reading Stats for the Year */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-bookclub-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Books Read</p>
                    <p className="text-2xl font-bold">{stats.booksRead}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pages Read</p>
                    <p className="text-2xl font-bold">{stats.totalPages.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                    <p className="text-2xl font-bold">{stats.averageRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Goal Progress</p>
                    <p className="text-2xl font-bold">{Math.round((stats.booksRead / 12) * 100)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-4">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Recently Finished</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="pages">Most Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reading Log Entries */}
          <div className="space-y-6">
            {userBooks.filter(ub => ub.status === 'completed').map((userBook) => {
              const book = getBookDetails(userBook.bookId);
              if (!book) return null;

              return (
                <Card key={userBook.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Book Cover */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-32 overflow-hidden rounded-md shadow-sm">
                          {book.coverimage ? (
                            <img 
                              src={book.coverimage} 
                              alt={book.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                              No Cover
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Book Details and Review */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">
                              <Link to={`/books/${book.id}`} className="hover:text-bookclub-primary">
                                {book.title}
                              </Link>
                            </h3>
                            <p className="text-gray-600 mb-2">by {book.author}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span>Started: {new Date(userBook.dateStarted!).toLocaleDateString()}</span>
                              <span>Finished: {new Date(userBook.dateFinished!).toLocaleDateString()}</span>
                              <span>{userBook.pagesRead} pages</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < (userBook.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">({userBook.rating}/5)</span>
                              {userBook.isFavorite && (
                                <Badge variant="secondary" className="ml-2">
                                  <Star className="w-3 h-3 mr-1 fill-current" />
                                  Favorite
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {userBook.review && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">My Review:</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{userBook.review}</p>
                          </div>
                        )}
                        
                        {userBook.notes && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Notes:</h4>
                            <p className="text-gray-600 text-sm leading-relaxed italic">{userBook.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/book-review/${book.id}`}>Edit Review</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {userBooks.filter(ub => ub.status === 'completed').length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No completed books yet</h3>
              <p className="text-gray-500 mb-6">Start reading and track your progress to build your reading log!</p>
              <Button asChild>
                <Link to="/books">Browse Books</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReadingLogPage;
