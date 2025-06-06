
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [isSaving, setIsSaving] = useState(false);
  
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
        const formattedBooks: Book[] = data.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          description: book.description || '',
          coverImage: book.coverimage || '',
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
  
  const handleAddBook = async (bookData: any) => {
    try {
      setIsSaving(true);
      console.log("Adding book with data:", bookData);
      
      const { data, error } = await supabase
        .from('books')
        .insert({
          title: bookData.title || '',
          author: bookData.author || '',
          description: bookData.description || '',
          coverimage: bookData.coverImage || '',
          categories: bookData.categories || [],
          rating: Number(bookData.rating) || 0
        })
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Book added successfully:", data);
      
      if (data) {
        const newBook: Book = {
          id: data.id,
          title: data.title,
          author: data.author,
          description: data.description || '',
          coverImage: data.coverimage || '',
          categories: data.categories || [],
          rating: data.rating || 0
        };
        
        setBooks([...books, newBook]);
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
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEditBook = (id: string) => {
    const book = books.find(b => b.id === id);
    if (book) {
      setCurrentBook(book);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleUpdateBook = async (bookData: any) => {
    if (!currentBook) return;
    
    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('books')
        .update({
          title: bookData.title || '',
          author: bookData.author || '',
          description: bookData.description || '',
          coverimage: bookData.coverImage || '',
          categories: bookData.categories || [],
          rating: Number(bookData.rating) || 0
        })
        .eq('id', currentBook.id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const updatedBook: Book = {
          id: data.id,
          title: data.title,
          author: data.author,
          description: data.description || '',
          coverImage: data.coverimage || '',
          categories: data.categories || [],
          rating: data.rating || 0
        };
        
        setBooks(books.map(book => 
          book.id === currentBook.id ? updatedBook : book
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
    } finally {
      setIsSaving(false);
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
        <CardContent>
          {books.length > 0 ? (
            <BookTable 
              books={books}
              onEdit={handleEditBook}
              onDelete={handleDeleteBook}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No books in the library yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Book
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Book Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Add Book</DialogTitle>
          <Tabs defaultValue="manual">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="google">Google Books</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="pt-4">
              <BookForm 
                onSubmit={handleAddBook} 
                onCancel={() => setIsAddDialogOpen(false)}
                isLoading={isSaving}
              />
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Edit Book</DialogTitle>
          {currentBook && (
            <BookForm 
              book={currentBook}
              onSubmit={handleUpdateBook}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setCurrentBook(null);
              }}
              isLoading={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBooks;
