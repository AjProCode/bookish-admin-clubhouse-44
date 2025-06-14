
import React, { useState, useEffect } from 'react';
import BookCard, { Book } from '@/components/BookCard';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const BooksPage: React.FC = () => {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch books from database
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('title');
          
        if (error) {
          console.error('Error fetching books:', error);
          return;
        }
        
        if (data) {
          const formattedBooks: Book[] = data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description,
            coverimage: book.coverimage,
            categories: book.categories,
            rating: book.rating,
          }));
          
          setAllBooks(formattedBooks);
        }
      } catch (error) {
        console.error('Error in fetchBooks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  // Get all unique categories from the fetched books
  const allCategories = Array.from(new Set(allBooks.flatMap(book => book.categories || [])));

  // Apply filters whenever books or filter values change
  useEffect(() => {
    let filtered = [...allBooks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(book => book.categories && book.categories.includes(categoryFilter));
    }

    // Rating filter
    if (ratingFilter !== 'All') {
      filtered = filtered.filter(book => book.rating === parseInt(ratingFilter));
    }

    // Sort books
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        // Keep original order (newest first)
        break;
    }

    setFilteredBooks(filtered);
  }, [allBooks, searchQuery, categoryFilter, ratingFilter, sortBy]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setRatingFilter('All');
    setSortBy('newest');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Browse Books</h1>
              <p className="text-gray-600">Discover books to enhance your skills and knowledge</p>
            </div>
            <div className="text-center py-12">
              <p className="text-gray-500">Loading books...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Books</h1>
            <p className="text-gray-600">Discover books to enhance your skills and knowledge</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters sidebar */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <SearchBar onSearch={handleSearch} />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Category</h3>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {allCategories.map(category => (
                      <SelectItem key={category} value={category || ''}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Rating</h3>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
            
            {/* Books grid */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                  Showing <span className="font-medium">{filteredBooks.length}</span> of {allBooks.length} books
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {filteredBooks.length === 0 ? (
                <div className="text-center py-12">
                  {allBooks.length === 0 ? (
                    <>
                      <h3 className="text-lg font-medium mb-2">No books available</h3>
                      <p className="text-gray-500">The library is empty. Add some books to get started!</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-2">No books found</h3>
                      <p className="text-gray-500">Try adjusting your filters or search query</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BooksPage;
