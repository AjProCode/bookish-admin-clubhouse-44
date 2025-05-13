
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import BookTable from '@/components/admin/BookTable';
import BookForm from '@/components/admin/BookForm';
import GoogleBooksIntegration from '@/components/GoogleBooksIntegration';
import { Book } from '@/components/BookCard';
import { supabase } from '@/integrations/supabase/client';

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  
  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');
        
      if (error) {
        console.error("Error fetching books:", error);
        return;
      }
      
      if (data) {
        // Format the data to match the Book interface
        const formattedBooks: Book[] = data.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          description: book.description || '',
          coverImage: book.coverimage || '', // Fixed: coverimage -> coverImage
          categories: book.categories || [],
          rating: book.rating || 0,
        }));
        
        setBooks(formattedBooks);
      }
    } catch (error) {
      console.error("Error in fetchBooks:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBooks();
  }, []);
  
  const handleAddBook = async (bookData: Partial<Book>) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert({
          title: bookData.title || '',
          author: bookData.author || '',
          description: bookData.description || '',
          coverimage: bookData.coverImage || '', // Fixed: coverImage -> coverimage
          categories: bookData.categories || [],
          rating: bookData.rating || 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setBooks([...books, {
          id: data.id,
          title: data.title,
          author: data.author,
          description: data.description || '',
          coverImage: data.coverimage || '', // Fixed: coverimage -> coverImage
          categories: data.categories || [],
          rating: data.rating || 0
        }]);
        
        setIsAddDialogOpen(false);
        
        toast({
          title: "Book Added",
          description: `"${data.title}" has been added to the library.`
        });
      }
    } catch (error: any) {
      console.error("Error adding book:", error);
      toast({
        title: "Error",
        description: `Failed to add book: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleEditBook = (id: string) => {
    const book = books.find(b => b.id === id);
    if (book) {
      setCurrentBook(book);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleUpdateBook = async (bookData: Partial<Book>) => {
    if (!currentBook) return;
    
    try {
      const { data, error } = await supabase
        .from('books')
        .update({
          title: bookData.title || '',
          author: bookData.author || '',
          description: bookData.description || '',
          coverimage: bookData.coverImage || '', // Fixed: coverImage -> coverimage
          categories: bookData.categories || [],
          rating: bookData.rating || 0
        })
        .eq('id', currentBook.id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setBooks(books.map(book => 
          book.id === currentBook.id ? {
            id: data.id,
            title: data.title,
            author: data.author,
            description: data.description || '',
            coverImage: data.coverimage || '', // Fixed: coverimage -> coverImage
            categories: data.categories || [],
            rating: data.rating || 0
          } : book
        ));
        
        setIsEditDialogOpen(false);
        setCurrentBook(null);
        
        toast({
          title: "Book Updated",
          description: `"${data.title}" has been updated.`
        });
      }
    } catch (error: any) {
      console.error("Error updating book:", error);
      toast({
        title: "Error",
        description: `Failed to update book: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteBook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setBooks(books.filter(book => book.id !== id));
      
      toast({
        title: "Book Deleted",
        description: "The book has been removed from the library."
      });
    } catch (error: any) {
      console.error("Error deleting book:", error);
      toast({
        title: "Error",
        description: `Failed to delete book: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading books...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Library Management</h2>
          <p className="text-muted-foreground">Manage your book collection</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Books ({books.length})</CardTitle>
        </CardHeader>
        <BookTable 
          books={books}
          onEdit={handleEditBook}
          onDelete={handleDeleteBook}
        />
      </Card>
      
      {/* Add Book Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>Add Book</DialogTitle>
          <Tabs defaultValue="manual">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="google">Google Books</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="pt-4">
              <BookForm onSubmit={handleAddBook} onCancel={() => setIsAddDialogOpen(false)} />
            </TabsContent>
            <TabsContent value="google" className="pt-4">
              <GoogleBooksIntegration onBookAdded={() => {
                setIsAddDialogOpen(false);
                fetchBooks();
              }} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Edit Book Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogTitle>Edit Book</DialogTitle>
          {currentBook && (
            <BookForm 
              book={currentBook}
              onSubmit={handleUpdateBook}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setCurrentBook(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBooks;
