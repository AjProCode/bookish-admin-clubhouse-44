import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserDetails, UserSubscription, SubscriptionPlan } from '@/models/UserBook';
import { Calendar } from 'lucide-react';

interface UserDetailsViewProps {
  user: UserDetails;
  onUpdateSubscription: (subscription: UserSubscription) => void;
}

const UserDetailsView: React.FC<UserDetailsViewProps> = ({ user, onUpdateSubscription }) => {
  const [subscriptionData, setSubscriptionData] = useState<UserSubscription>(
    user.subscription || {
      id: Date.now().toString(),
      userId: user.id,
      plan: 'none' as SubscriptionPlan,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      isActive: false
    }
  );
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubscriptionData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: any) => {
    setSubscriptionData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = () => {
    onUpdateSubscription({
      ...subscriptionData,
      isActive: subscriptionData.plan !== 'none'
    });
    setIsEditing(false);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateEndDate = (startDate: string, plan: SubscriptionPlan): string => {
    if (plan === 'none') return startDate;
    
    const start = new Date(startDate);
    const end = new Date(start);
    
    switch(plan) {
      case 'monthly':
        end.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(start.getMonth() + 3);
        break;
      case 'biannual':
        end.setMonth(start.getMonth() + 6);
        break;
      case 'annual':
        end.setFullYear(start.getFullYear() + 1);
        break;
      default:
        break;
    }
    
    return end.toISOString().split('T')[0];
  };
  
  const handlePlanChange = (plan: string) => {
    const endDate = calculateEndDate(subscriptionData.startDate, plan as SubscriptionPlan);
    setSubscriptionData(prev => ({ 
      ...prev, 
      plan: plan as SubscriptionPlan,
      endDate
    }));
  };
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const endDate = calculateEndDate(value, subscriptionData.plan);
    setSubscriptionData(prev => ({ 
      ...prev, 
      startDate: value,
      endDate
    }));
  };
  
  return (
    <Tabs defaultValue="subscription" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="reading">Reading Log</TabsTrigger>
        <TabsTrigger value="bookshelf">Bookshelf</TabsTrigger>
      </TabsList>
      
      {/* Subscription Tab */}
      <TabsContent value="subscription">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Subscription Details</span>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>Edit Subscription</Button>
              )}
            </CardTitle>
            <CardDescription>Manage the user's subscription plan and details</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Subscription Plan</Label>
                    <Select
                      value={subscriptionData.plan}
                      onValueChange={(value) => handlePlanChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="monthly">Monthly (₹1199)</SelectItem>
                        <SelectItem value="quarterly">Quarterly - 3 Months (₹3000)</SelectItem>
                        <SelectItem value="biannual">Biannual - 6 Months (₹5500)</SelectItem>
                        <SelectItem value="annual">Annual (₹10000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="isActive">Status</Label>
                    <Select
                      value={subscriptionData.isActive ? "active" : "inactive"}
                      onValueChange={(value) => handleSelectChange('isActive', value === "active")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={subscriptionData.startDate}
                      onChange={handleStartDateChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={subscriptionData.endDate}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nextDeliveryDate">Next Delivery Date</Label>
                    <Input
                      id="nextDeliveryDate"
                      name="nextDeliveryDate"
                      type="date"
                      value={subscriptionData.nextDeliveryDate || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="booksDelivered">Books Delivered</Label>
                    <Input
                      id="booksDelivered"
                      name="booksDelivered"
                      type="number"
                      min="0"
                      value={subscriptionData.booksDelivered || 0}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Subscription Plan</h3>
                  <p className="text-lg">
                    {subscriptionData.plan === 'none' ? 'No Subscription' : (
                      <>
                        {subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1)}
                        {' '}
                        <Badge variant={subscriptionData.isActive ? "outline" : "secondary"} className={subscriptionData.isActive ? "border-green-500 text-green-500 ml-2" : "ml-2"}>
                          {subscriptionData.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </>
                    )}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Books Delivered</h3>
                  <p className="text-lg">{subscriptionData.booksDelivered || 0}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Start Date</h3>
                  <p className="text-lg flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDate(subscriptionData.startDate)}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">End Date</h3>
                  <p className="text-lg flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDate(subscriptionData.endDate)}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Next Delivery</h3>
                  <p className="text-lg flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDate(subscriptionData.nextDeliveryDate)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Changes</Button>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
      
      {/* Reading Log Tab */}
      <TabsContent value="reading">
        <Card>
          <CardHeader>
            <CardTitle>Reading Log</CardTitle>
            <CardDescription>The user's reading activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            {user.readingLogs && user.readingLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Book ID</TableHead>
                    <TableHead>Minutes Read</TableHead>
                    <TableHead>Pages Read</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.readingLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.date)}</TableCell>
                      <TableCell>{log.bookId}</TableCell>
                      <TableCell>{log.minutesRead}</TableCell>
                      <TableCell>{log.pagesRead}</TableCell>
                      <TableCell>{log.notes || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">No reading logs found for this user.</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Bookshelf Tab */}
      <TabsContent value="bookshelf">
        <Card>
          <CardHeader>
            <CardTitle>Bookshelf</CardTitle>
            <CardDescription>Books in the user's collection</CardDescription>
          </CardHeader>
          <CardContent>
            {user.userBooks && user.userBooks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Favorite</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.userBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>{book.bookId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(book.dateAdded)}</TableCell>
                      <TableCell>{book.rating || 'Not rated'}</TableCell>
                      <TableCell>
                        {book.isFavorite ? (
                          <Badge variant="default">Favorite</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">No books found in this user's bookshelf.</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default UserDetailsView;
