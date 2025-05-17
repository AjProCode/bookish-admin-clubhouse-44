
import React, { useState } from 'react';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookCard, { Book } from '@/components/BookCard';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { ReadingStatus, UserBook, BookshelfFilters } from '@/models/UserBook';
import { Badge } from '@/components/ui/badge';
import { BookOpen, BookText, Star } from 'lucide-react';

// Sample data for demonstration
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

const userBooks: UserBook[] = [
  { 
    id: '101',
    bookId: '1',
    userId: 'user1',
    status: 'completed',
    dateAdded: '2023-01-15',
    dateStarted: '2023-01-20',
    dateFinished: '2023-02-10',
    rating: 5,
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

// Helper function to find book details from a user book
const findBookDetails = (bookId: string): Book | undefined => {
  return allBooks.find(book => book.id === bookId);
};

const statusLabels: Record<ReadingStatus, string> = {
  'want_to_read': 'Want to Read',
  'reading': 'Currently Reading',
  'completed': 'Completed',
  'dnf': 'Did Not Finish'
};

const BookshelfPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filters, setFilters] = useState<BookshelfFilters>({
    status: 'all',
    favorite: false,
    searchQuery: '',
  });

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleFavoriteToggle = () => {
    setFilters(prev => ({ ...prev, favorite: !prev.favorite }));
  };

  const filteredUserBooks = userBooks.filter(userBook => {
    const book = findBookDetails(userBook.bookId);
    if (!book) return false;

    // Apply status filter
    if (filters.status !== 'all' && userBook.status !== filters.status) return false;

    // Apply favorite filter
    if (filters.favorite && !userBook.isFavorite) return false;

    // Apply search filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      return book.title.toLowerCase().includes(searchLower) || 
             book.author.toLowerCase().includes(searchLower);
    }

    return true;
  });

  const handleStatusChange = (status: ReadingStatus | 'all') => {
    setFilters(prev => ({ ...prev, status }));
    setActiveTab(status);
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Bookshelf</h1>
            <p className="text-gray-600">Track your reading journey and manage your personal library</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Filters sidebar */}
            <div className="w-full lg:w-1/4 bg-white p-4 rounded-lg shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Find Books</h2>
                <SearchBar onSearch={handleSearch} placeholder="Search your books..." />
              </div>

              <div>
                <Button 
                  variant={filters.favorite ? "default" : "outline"}
                  onClick={handleFavoriteToggle}
                  className="w-full flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  <span>Favorites Only</span>
                </Button>
              </div>
            </div>

            {/* Books content */}
            <div className="w-full lg:w-3/4 bg-white rounded-lg shadow-sm p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-4 mb-4">
                  <TabsTrigger value="all" onClick={() => handleStatusChange('all')}>
                    All
                  </TabsTrigger>
                  <TabsTrigger value="want_to_read" onClick={() => handleStatusChange('want_to_read')}>
                    Want to Read
                  </TabsTrigger>
                  <TabsTrigger value="reading" onClick={() => handleStatusChange('reading')}>
                    Reading
                  </TabsTrigger>
                  <TabsTrigger value="completed" onClick={() => handleStatusChange('completed')}>
                    Completed
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {filteredUserBooks.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No books found</h3>
                      <p className="text-gray-500 mb-4">Try adjusting your filters or add some books to your shelf</p>
                      <Button 
                        onClick={() => navigate('/books')}
                        className="inline-flex items-center gap-2"
                      >
                        <BookText className="h-4 w-4" />
                        Browse Books
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredUserBooks.map(userBook => {
                        const book = findBookDetails(userBook.bookId);
                        if (!book) return null;
                        
                        return (
                          <div key={userBook.id} className="relative">
                            <Badge 
                              className="absolute top-2 right-2 z-10"
                              variant={userBook.status === 'completed' ? 'default' : 
                                      userBook.status === 'reading' ? 'secondary' : 'outline'}
                            >
                              {statusLabels[userBook.status]}
                            </Badge>
                            {userBook.isFavorite && (
                              <div className="absolute top-2 left-2 z-10">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              </div>
                            )}
                            <div onClick={() => handleBookClick(book.id)}>
                              <BookCard book={book} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookshelfPage;
