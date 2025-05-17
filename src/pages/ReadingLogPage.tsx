
import React, { useState } from 'react';
import Navbar from '@/compo
import Footer from '@/components/Footer';
import { UserBook } from '@/models/UserBook';
import { Book } from '@/components/BookCard';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import SearchBar from '@/components/SearchBar';

// Sample data
const allBooks: Book[] = [
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
];

const readingEntries: UserBook[] = [
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
    review: 'Amazing book that changed my habits.',
    isFavorite: true
  },
  { 
    id: '102',
    bookId: '2',
    userId: 'user1',
    status: 'reading',
    dateAdded: '2023-03-05',
    dateStarted: '2023-03-10',
    pagesRead: 120,
    notes: 'Currently on chapter 5. Interesting concepts about deep work state.',
    isFavorite: false
  },
  { 
    id: '103',
    bookId: '3',
    userId: 'user1',
    status: 'want_to_read',
    dateAdded: '2023-04-20',
    isFavorite: false
  },
];

// Helper function to find book details
const getBookDetails = (bookId: string): Book | undefined => {
  return allBooks.find(book => book.id === bookId);
};

// Helper to format dates nicely
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const statusColors: Record<string, string> = {
  'want_to_read': 'bg-gray-200 text-gray-800',
  'reading': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'dnf': 'bg-red-100 text-red-800'
};

const statusLabels: Record<string, string> = {
  'want_to_read': 'Want to Read',
  'reading': 'Currently Reading',
  'completed': 'Completed',
  'dnf': 'Did Not Finish'
};

const ReadingLogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter entries based on search
  const filteredEntries = readingEntries.filter(entry => {
    if (!searchQuery) return true;
    
    const book = getBookDetails(entry.bookId);
    if (!book) return false;
    
    const query = searchQuery.toLowerCase();
    return book.title.toLowerCase().includes(query) || 
           book.author.toLowerCase().includes(query);
  });

  // Sort entries by date (most recent first)
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const dateA = a.dateStarted || a.dateAdded;
    const dateB = b.dateStarted || b.dateAdded;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Reading Log</h1>
            <p className="text-gray-600">Track your reading progress and reflection</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search your reading log..."
              />
              
              <Link to="/bookshelf">
                <Button variant="outline" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  View Bookshelf
                </Button>
              </Link>
            </div>
            
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No reading entries found</h3>
                <p className="text-gray-500">Start tracking your reading progress</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Finished</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEntries.map(entry => {
                      const book = getBookDetails(entry.bookId);
                      if (!book) return null;
                      
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            <Link to={`/books/${book.id}`} className="flex items-center gap-3 hover:text-bookclub-primary">
                              <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                {book.coverImage ? (
                                  <img 
                                    src={book.coverImage} 
                                    alt={book.title} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    {book.title.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{book.title}</p>
                                <p className="text-sm text-gray-500">{book.author}</p>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              entry.status === 'completed' ? 'default' :
                              entry.status === 'reading' ? 'secondary' :
                              entry.status === 'dnf' ? 'destructive' : 'outline'
                            }>
                              {statusLabels[entry.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(entry.dateStarted)}</TableCell>
                          <TableCell>{formatDate(entry.dateFinished)}</TableCell>
                          <TableCell>
                            {entry.pagesRead ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {entry.pagesRead} pages
                              </span>
                            ) : 'Not started'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.notes ? entry.notes : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/books/${book.id}/review`}>
                              <Button variant="ghost" size="sm">
                                {entry.status === 'completed' ? 'View' : 'Update'}
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReadingLogPage;
