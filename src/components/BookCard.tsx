
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverimage: string | null;
  categories: string[] | null;
  rating: number | null;
  description: string | null;
}

interface BookCardProps {
  book: Book;
  showRating?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, showRating = true }) => {
  return (
    <Card className="h-full overflow-hidden">
      <Link to={`/books/${book.id}`}>
        <div className="relative pt-[60%] overflow-hidden">
          {book.coverimage ? (
            <img 
              src={book.coverimage} 
              alt={`${book.title} cover`}
              className="absolute top-0 left-0 w-full h-full object-cover book-cover"
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full bg-bookclub-accent flex items-center justify-center text-bookclub-primary font-bold">
              {book.title.substring(0, 1)}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1 mb-1">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{book.author}</p>
          {showRating && book.rating && (
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  className={`w-4 h-4 ${i < book.rating! ? 'text-yellow-500' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {book.categories && book.categories.slice(0, 2).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">{category}</Badge>
            ))}
            {book.categories && book.categories.length > 2 && (
              <Badge variant="outline" className="text-xs">+{book.categories.length - 2}</Badge>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default BookCard;
