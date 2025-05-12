
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
    averageRating?: number;
    publishedDate?: string;
  };
}

interface GoogleBookSearchProps {
  onSelectBook: (bookData: {
    title: string;
    author: string;
    description: string;
    coverImage: string;
    categories: string[];
    rating: number;
  }) => void;
}

const GoogleBookSearch: React.FC<GoogleBookSearchProps> = ({ onSelectBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }
    
    setIsSearching(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=10`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch books from Google Books API');
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        setSearchResults(data.items);
      } else {
        setSearchResults([]);
        setError('No books found matching your search');
      }
    } catch (error) {
      console.error('Error searching Google Books:', error);
      setError('Error connecting to Google Books API');
      toast({
        title: 'API Error',
        description: 'Could not connect to Google Books API',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBook = (book: Book) => {
    const bookData = {
      title: book.volumeInfo.title || 'Unknown Title',
      author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author',
      description: book.volumeInfo.description || '',
      coverImage: book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      categories: book.volumeInfo.categories || [],
      rating: book.volumeInfo.averageRating || 0,
    };
    
    onSelectBook(bookData);
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search books by title, author, or ISBN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isSearching || !searchTerm.trim()}>
          {isSearching ? 'Searching...' : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </form>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {searchResults.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex p-4">
                  <div className="flex-shrink-0 w-20 h-28 overflow-hidden bg-gray-100 flex items-center justify-center rounded-md">
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img 
                        src={book.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')} 
                        alt={book.volumeInfo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-indigo-700 line-clamp-2">{book.volumeInfo.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author'}
                    </p>
                    {book.volumeInfo.publishedDate && (
                      <p className="text-xs text-gray-500">{book.volumeInfo.publishedDate}</p>
                    )}
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-indigo-600 border-indigo-300"
                        onClick={() => handleSelectBook(book)}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleBookSearch;
