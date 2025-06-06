import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    averageRating?: number;
  };
}

interface GoogleBooksIntegrationProps {
  onBookAdded?: () => void;
}

const GoogleBooksIntegration: React.FC<GoogleBooksIntegrationProps> = ({ onBookAdded }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([]);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  
  const searchGoogleBooks = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        setSearchResults(data.items);
      }
    } catch (error) {
      console.error('Error searching Google Books:', error);
      toast({
        title: 'Search Failed',
        description: 'Could not connect to Google Books API',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddBook = async (book: GoogleBook) => {
    setIsAdding(book.id);
    
    try {
      // Format book data for database
      const bookData = {
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
        description: book.volumeInfo.description || '',
        coverimage: book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail || '',
        categories: book.volumeInfo.categories || [],
        rating: book.volumeInfo.averageRating || 0
      };
      
      // Add book to database
      const { data, error } = await supabase
        .from('books')
        .insert(bookData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Book Added',
        description: `"${book.volumeInfo.title}" has been added to your library`,
      });
      
      // Notify parent component if needed
      if (onBookAdded) {
        onBookAdded();
      }
      
    } catch (error: any) {
      console.error('Error adding book:', error?.message || error);
      toast({
        title: 'Failed to Add Book',
        description: error?.message || 'There was an error adding the book to your library',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(null);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchGoogleBooks();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for books by title, author, or ISBN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1"
        />
        <Button 
          onClick={searchGoogleBooks} 
          disabled={isSearching || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSearching ? 'Searching...' : 'Search'}
          {!isSearching && <Search className="ml-2 h-4 w-4" />}
        </Button>
      </div>
      
      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-indigo-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-2 text-indigo-700">Searching Google Books...</p>
        </div>
      )}
      
      {!isSearching && searchResults.length === 0 && query && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2">No books found. Try a different search term.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {searchResults.map((book) => (
          <Card key={book.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex h-full">
              <div className="p-4 flex items-center justify-center bg-gray-100 w-1/3">
                {book.volumeInfo.imageLinks?.thumbnail ? (
                  <img
                    src={book.volumeInfo.imageLinks.thumbnail}
                    alt={`${book.volumeInfo.title} cover`}
                    className="max-h-36 object-contain"
                  />
                ) : (
                  <div className="h-36 w-24 flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold">
                    No Cover
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{book.volumeInfo.title}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown author'}
                  </p>
                </CardHeader>
                
                <CardContent className="pb-2 flex-grow">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {book.volumeInfo.description || 'No description available'}
                  </p>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {book.volumeInfo.categories?.slice(0, 3).map((category, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-indigo-50">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    onClick={() => handleAddBook(book)} 
                    disabled={isAdding === book.id}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isAdding === book.id ? 'Adding...' : 'Add to Library'}
                    {isAdding !== book.id && <Plus className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GoogleBooksIntegration;
