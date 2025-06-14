
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BookTable from '@/components/admin/BookTable';
import BookForm from '@/components/admin/BookForm';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/components/BookCard';

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) {
        console.error('Error fetching books:', error);
        return;
      }

      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleAddBook = async (bookData: any) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('books')
        .insert([{
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          coverimage: bookData.coverImage,
          categories: bookData.categories || [],
          rating: bookData.rating || 0
        }]);

      if (error) {
        toast({
          title: "Error adding book",
          description: error.message,
          variant: "destructive"
        });
      } else {
        await fetchBooks();
        setIsAddDialogOpen(false);
        
        toast({
          title: "Book Added",
          description: `"${bookData.title}" has been added to the library.`,
        });
      }
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleEditBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setCurrentBook(book);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateBook = async (bookData: any) => {
    if (!currentBook) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          coverimage: bookData.coverImage,
          categories: bookData.categories || [],
          rating: bookData.rating || 0
        })
        .eq('id', currentBook.id);

      if (error) {
        toast({
          title: "Error updating book",
          description: error.message,
          variant: "destructive"
        });
      } else {
        await fetchBooks();
        setIsEditDialogOpen(false);
        setCurrentBook(null);
        
        toast({
          title: "Book Updated",
          description: `"${bookData.title}" has been updated.`,
        });
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast({
        title: "Error",
        description: "Failed to update book",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) {
        toast({
          title: "Error deleting book",
          description: error.message,
          variant: "destructive"
        });
      } else {
        await fetchBooks();
        toast({
          title: "Book Deleted",
          description: "The book has been removed from the library.",
        });
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Books ({books.length})</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </div>
        
        {books.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No books found</h3>
            <p className="text-gray-500">Add books to your library to get started.</p>
          </div>
        ) : (
          <BookTable 
            books={books} 
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
          />
        )}
      </div>
      
      {/* Add Book Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Add a new book to your library.
          </DialogDescription>
          <BookForm 
            onSubmit={handleAddBook}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Book Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>
            Update the book information.
          </DialogDescription>
          {currentBook && (
            <BookForm 
              book={{
                ...currentBook,
                description: currentBook.description || ''
              }}
              onSubmit={handleUpdateBook}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBooks;
