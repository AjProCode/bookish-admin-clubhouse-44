
import React, { useState } from 'react';
import { Book } from '@/components/BookCard';
import AdminHeader from '@/components/admin/AdminHeader';
import BookTable from '@/components/admin/BookTable';
import BookForm from '@/components/admin/BookForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

// Sample books data
const initialBooks: (Book & { description: string })[] = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Self-Help', 'Productivity'],
    rating: 5,
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day.'
  },
  {
    id: '2',
    title: 'Deep Work',
    author: 'Cal Newport',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Productivity', 'Business'],
    rating: 4,
    description: 'Deep work is the ability to focus without distraction on a cognitively demanding task.'
  },
  {
    id: '3',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    coverImage: 'https://images.unsplash.com/photo-1553729784-e91953dec042?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Finance', 'Psychology'],
    rating: 5,
    description: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave.'
  },
  {
    id: '4',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    categories: ['Psychology', 'Science'],
    rating: 4,
    description: 'In the highly anticipated Thinking, Fast and Slow, Kahneman takes us on a groundbreaking tour of the mind.'
  },
];

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<(Book & { description: string })[]>(initialBooks);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<(Book & { description: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddBook = (bookData: any) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newBook = {
        ...bookData,
        id: Date.now().toString(),
      };
      
      setBooks([newBook, ...books]);
      setIsAddDialogOpen(false);
      setIsLoading(false);
      
      toast({
        title: "Book Added",
        description: `${bookData.title} has been added to your collection.`,
      });
    }, 1000);
  };
  
  const handleEditBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setCurrentBook(book);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleUpdateBook = (bookData: any) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const updatedBooks = books.map(book => 
        book.id === currentBook?.id ? { ...book, ...bookData } : book
      );
      
      setBooks(updatedBooks);
      setIsEditDialogOpen(false);
      setCurrentBook(null);
      setIsLoading(false);
      
      toast({
        title: "Book Updated",
        description: `${bookData.title} has been updated.`,
      });
    }, 1000);
  };
  
  const handleDeleteBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setCurrentBook(book);
      setIsDeleteDialogOpen(true);
    }
  };
  
  const confirmDelete = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const updatedBooks = books.filter(book => book.id !== currentBook?.id);
      
      setBooks(updatedBooks);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Book Deleted",
        description: `${currentBook?.title} has been removed from your collection.`,
      });
      
      setCurrentBook(null);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Book Management" />
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Books ({books.length})</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </div>
        
        <BookTable 
          books={books} 
          onEdit={handleEditBook} 
          onDelete={handleDeleteBook} 
        />
      </div>
      
      {/* Add Book Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Add a new book to your collection. Fill out the form below.
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>
            Update the book information.
          </DialogDescription>
          {currentBook && (
            <BookForm 
              book={currentBook}
              onSubmit={handleUpdateBook}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{currentBook?.title}"? This action cannot be undone.
          </DialogDescription>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBooks;
