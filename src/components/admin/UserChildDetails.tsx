
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calendar, Clock, BookOpen, BarChart2 } from 'lucide-react';
import { UserReadingLog } from '@/models/UserBook';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
}

interface ChildDetailsProps {
  childId: string;
  childName: string;
  readingLogs: UserReadingLog[];
  booksRead: number;
  age?: number | string;
  readingLevel?: string;
  favoriteGenres?: string[];
  readingTimeByDay?: Array<{ day: string; minutes: number }>;
}

const UserChildDetails: React.FC<ChildDetailsProps> = ({
  childId,
  childName,
  readingLogs,
  booksRead,
  age = 'N/A',
  readingLevel = 'N/A',
  favoriteGenres = [],
  readingTimeByDay = [
    { day: 'Mon', minutes: 0 },
    { day: 'Tue', minutes: 0 },
    { day: 'Wed', minutes: 0 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 0 },
    { day: 'Sat', minutes: 0 },
    { day: 'Sun', minutes: 0 },
  ],
}) => {
  const [books, setBooks] = useState<Record<string, Book>>({});
  
  // Load books data
  useEffect(() => {
    const fetchBooks = async () => {
      const bookIds = Array.from(new Set(readingLogs.map(log => log.bookId)));
      
      if (bookIds.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('books')
          .select('id, title, author, coverImage')
          .in('id', bookIds);
          
        if (error) {
          console.error("Error fetching books:", error);
          return;
        }
        
        if (data) {
          const booksMap: Record<string, Book> = {};
          data.forEach(book => {
            booksMap[book.id] = book;
          });
          setBooks(booksMap);
        }
      } catch (err) {
        console.error("Error in fetchBooks:", err);
      }
    };
    
    fetchBooks();
  }, [readingLogs]);
  
  // Process reading logs to populate readingTimeByDay
  const processedReadingTimeByDay = [...readingTimeByDay];
  
  readingLogs.forEach(log => {
    const date = new Date(log.date);
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust to make Monday first (0)
    
    if (processedReadingTimeByDay[adjustedIndex]) {
      processedReadingTimeByDay[adjustedIndex].minutes += log.minutesRead;
    }
  });
  
  // Calculate total reading time
  const totalReadingTime = readingLogs.reduce((total, log) => total + log.minutesRead, 0);
  const totalPagesRead = readingLogs.reduce((total, log) => total + log.pagesRead, 0);
  
  const getBookTitle = (bookId: string) => {
    return books[bookId]?.title || bookId;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-indigo-700">{childName}'s Reading Profile</CardTitle>
        <CardDescription>Detailed reading activity and progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <BookOpen className="h-8 w-8 text-indigo-500 mb-2" />
              <p className="text-sm text-gray-500">Books Read</p>
              <h3 className="font-bold text-2xl text-indigo-700">{booksRead}</h3>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Clock className="h-8 w-8 text-indigo-500 mb-2" />
              <p className="text-sm text-gray-500">Total Reading Time</p>
              <h3 className="font-bold text-2xl text-indigo-700">{Math.floor(totalReadingTime / 60)}h {totalReadingTime % 60}m</h3>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <BarChart2 className="h-8 w-8 text-indigo-500 mb-2" />
              <p className="text-sm text-gray-500">Pages Read</p>
              <h3 className="font-bold text-2xl text-indigo-700">{totalPagesRead}</h3>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Calendar className="h-8 w-8 text-indigo-500 mb-2" />
              <p className="text-sm text-gray-500">Reading Level</p>
              <h3 className="font-bold text-2xl text-indigo-700">{readingLevel}</h3>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="reading-activity">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="reading-activity" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Reading Activity</TabsTrigger>
            <TabsTrigger value="reading-analytics" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reading-activity">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Time Read</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readingLogs.length > 0 ? (
                    readingLogs.map((log, index) => (
                      <TableRow key={log.id || index}>
                        <TableCell>
                          {new Date(log.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>{getBookTitle(log.bookId)}</TableCell>
                        <TableCell>{log.minutesRead} minutes</TableCell>
                        <TableCell>{log.pagesRead} pages</TableCell>
                        <TableCell className="max-w-xs truncate">{log.notes || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No reading logs found for this child
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="reading-analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Reading Time by Day of Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedReadingTimeByDay}>
                        <XAxis dataKey="day" stroke="#6366f1" />
                        <YAxis stroke="#6366f1" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value) => [`${value} minutes`, 'Reading Time']}
                          labelFormatter={(label) => `Day: ${label}`}
                        />
                        <Bar dataKey="minutes" fill="#818cf8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Favorite Genres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {favoriteGenres.length > 0 ? (
                        favoriteGenres.map((genre, index) => (
                          <Badge key={index} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1">
                            {genre}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No favorite genres recorded yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Reading Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Weekly Goal Completion</span>
                          <span className="text-sm font-medium text-indigo-700">75%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Monthly Reading Target</span>
                          <span className="text-sm font-medium text-indigo-700">60%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserChildDetails;
