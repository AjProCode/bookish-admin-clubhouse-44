
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Book } from '@/components/BookCard';
import { UserBook, ReadingStatus } from '@/models/UserBook';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Star, BookOpen, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";

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
    status: 'reading',
    dateAdded: '2023-03-05',
    dateStarted: '2023-03-10',
    pagesRead: 120,
    notes: 'Currently on chapter 5. Interesting concepts about deep work state.',
    isFavorite: false
  },
];

const statusLabels: Record<ReadingStatus, string> = {
  'want_to_read': 'Want to Read',
  'reading': 'Currently Reading',
  'completed': 'Completed',
  'dnf': 'Did Not Finish'
};

const BookReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Find the book details
  const book = allBooks.find(book => book.id === id);
  
  // Find user's reading entry for this book
  const userBook = userBooks.find(entry => entry.bookId === id);
  
  // Form state
  const [formData, setFormData] = useState<Partial<UserBook>>(userBook || {
    bookId: id || '',
    status: 'want_to_read' as ReadingStatus,
    dateAdded: new Date().toISOString().split('T')[0],
    isFavorite: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: ReadingStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleFavoriteToggle = () => {
    setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically save the review data to your backend
    console.log("Saving review:", formData);
    
    toast.success("Your reading record has been updated!");
  };

  if (!book) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Book Not Found</h1>
            <p className="mb-6">We couldn't find the book you're looking for.</p>
            <Button asChild>
              <Link to="/books">Browse Books</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Link to={`/books/${id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-bookclub-primary mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to book details
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book info section */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-56 mb-4 overflow-hidden rounded-md shadow-md">
                      {book.coverImage ? (
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600">
                          No Cover
                        </div>
                      )}
                    </div>
                    
                    <h1 className="text-xl font-bold text-center">{book.title}</h1>
                    <p className="text-gray-600 mb-2">{book.author}</p>
                    
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < (book.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                      {book.categories.map(category => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    
                    {userBook && (
                      <div className="w-full">
                        <div className="flex justify-between items-center py-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Status</span>
                          <Badge variant="outline">{statusLabels[userBook.status]}</Badge>
                        </div>
                        {userBook.dateStarted && (
                          <div className="flex justify-between items-center py-2 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Started</span>
                            <span className="text-sm">{new Date(userBook.dateStarted).toLocaleDateString()}</span>
                          </div>
                        )}
                        {userBook.dateFinished && (
                          <div className="flex justify-between items-center py-2 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Finished</span>
                            <span className="text-sm">{new Date(userBook.dateFinished).toLocaleDateString()}</span>
                          </div>
                        )}
                        {userBook.pagesRead && (
                          <div className="flex justify-between items-center py-2 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Pages Read</span>
                            <span className="text-sm">{userBook.pagesRead}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Review form section */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-6">
                {userBook?.review ? 'Edit Your Review' : 'Add to Your Reading Log'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="status" className="mb-2 block">Reading Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['want_to_read', 'reading', 'completed', 'dnf'] as ReadingStatus[]).map(status => (
                        <Button 
                          key={status}
                          type="button"
                          size="sm"
                          variant={formData.status === status ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(status)}
                        >
                          {statusLabels[status]}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="pagesRead" className="mb-2 block">Pages Read</Label>
                    <Input 
                      type="number" 
                      id="pagesRead"
                      name="pagesRead"
                      placeholder="Number of pages read"
                      value={formData.pagesRead || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="dateStarted" className="mb-2 block">Date Started</Label>
                    <Input 
                      type="date" 
                      id="dateStarted"
                      name="dateStarted"
                      value={formData.dateStarted?.split('T')[0] || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dateFinished" className="mb-2 block">Date Finished</Label>
                    <Input 
                      type="date" 
                      id="dateFinished"
                      name="dateFinished"
                      value={formData.dateFinished?.split('T')[0] || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rating" className="mb-2 block">Your Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Button
                        key={rating}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRatingChange(rating)}
                        className="p-1"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            (formData.rating || 0) >= rating
                              ? 'text-yellow-500 fill-yellow-500' 
                              : 'text-gray-300'
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="review" className="mb-2 block">Your Review</Label>
                  <Textarea 
                    id="review"
                    name="review"
                    placeholder="Write your thoughts about the book..."
                    rows={5}
                    value={formData.review || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes" className="mb-2 block">Private Notes</Label>
                  <Textarea 
                    id="notes"
                    name="notes"
                    placeholder="Any notes for yourself..."
                    rows={3}
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">These notes are only visible to you</p>
                </div>
                
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant={formData.isFavorite ? "default" : "outline"}
                    onClick={handleFavoriteToggle}
                    className="flex items-center gap-2"
                  >
                    <Star className={`h-4 w-4 ${formData.isFavorite ? 'fill-white' : ''}`} />
                    {formData.isFavorite ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/books/${id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit">Save Reading Record</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookReviewPage;
