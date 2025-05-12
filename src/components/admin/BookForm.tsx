
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GoogleBookSearch from './GoogleBookSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book } from '../BookCard';

interface BookFormProps {
  book?: Partial<Book & { description: string }>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const BookForm: React.FC<BookFormProps> = ({
  book,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = React.useState({
    title: book?.title || '',
    author: book?.author || '',
    coverImage: book?.coverImage || '',
    description: book?.description || '',
    rating: book?.rating?.toString() || '0',
    categories: book?.categories?.join(', ') || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, rating: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedData = {
      ...formData,
      rating: Number(formData.rating),
      categories: formData.categories.split(',').map(cat => cat.trim()).filter(Boolean),
    };
    
    onSubmit(processedData);
  };

  const handleGoogleBookSelect = (bookData: {
    title: string;
    author: string;
    description: string;
    coverImage: string;
    categories: string[];
    rating: number;
  }) => {
    setFormData({
      title: bookData.title,
      author: bookData.author,
      coverImage: bookData.coverImage,
      description: bookData.description,
      rating: bookData.rating.toString(),
      categories: bookData.categories.join(', '),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{book ? 'Edit Book' : 'Add New Book'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manual" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Manual Entry</TabsTrigger>
              <TabsTrigger value="search" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Search Google Books</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search">
              <div className="mb-6">
                <GoogleBookSearch onSelectBook={handleGoogleBookSelect} />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            {formData.coverImage && (
              <div className="mt-2 w-24 h-32 overflow-hidden rounded border">
                <img src={formData.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categories">Categories (comma-separated)</Label>
              <Input
                id="categories"
                name="categories"
                value={formData.categories}
                onChange={handleChange}
                placeholder="Fiction, Fantasy, Adventure"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={formData.rating}
                onValueChange={handleSelectChange}
                defaultValue="0"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Not rated</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            {isLoading ? 'Saving...' : (book ? 'Update' : 'Save')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default BookForm;
