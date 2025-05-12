
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UserChildDetails from './UserChildDetails';
import { UserDetails, UserSubscription, SubscriptionPlan, UserBook } from "@/models/UserBook";

interface UserDetailsViewProps {
  user: UserDetails;
  onUpdateSubscription: (subscriptionData: UserSubscription) => void;
}

const UserDetailsView: React.FC<UserDetailsViewProps> = ({
  user,
  onUpdateSubscription
}) => {
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<UserSubscription>(
    user.subscription || {
      id: "",
      userId: user.id,
      plan: "none",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      isActive: true
    }
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubscriptionData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: any) => {
    setSubscriptionData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSubscription(subscriptionData);
    setShowSubscriptionForm(false);
  };
  
  const calculateNextPeriod = (plan: SubscriptionPlan): number => {
    switch(plan) {
      case 'monthly': return 1;
      case 'quarterly': return 3;
      case 'biannual': return 6;
      case 'annual': return 12;
      default: return 1;
    }
  };
  
  const handlePlanChange = (plan: string) => {
    const nextPeriod = calculateNextPeriod(plan as SubscriptionPlan);
    const startDate = new Date(subscriptionData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + nextPeriod);
    
    setSubscriptionData(prev => ({
      ...prev,
      plan: plan as SubscriptionPlan,
      endDate: endDate.toISOString().split('T')[0]
    }));
  };
  
  const formatDateString = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Basic details about the user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Name</Label>
                  <div className="text-lg font-medium">{user.name}</div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <div className="text-lg font-medium">{user.email}</div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Join Date</Label>
                  <div>{user.joinDate}</div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Role</Label>
                  <div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <div>
                    <Badge 
                      variant={user.status === 'active' ? 'outline' : 'secondary'}
                      className={user.status === 'active' ? 'border-green-500 text-green-500' : 'border-gray-400 text-gray-500'}
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Books Read</Label>
                  <div className="text-lg font-medium">{user.booksRead}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>User's membership details</CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowSubscriptionForm(!showSubscriptionForm)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {showSubscriptionForm ? 'Cancel' : 'Edit Subscription'}
              </Button>
            </CardHeader>
            <CardContent>
              {showSubscriptionForm ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Subscription Plan</Label>
                    <Select
                      value={subscriptionData.plan}
                      onValueChange={(value) => handlePlanChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly (3 Months)</SelectItem>
                        <SelectItem value="biannual">Biannual (6 Months)</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={subscriptionData.startDate}
                        onChange={handleInputChange}
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
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="isActive">Active</Label>
                    <Input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={subscriptionData.isActive}
                      onChange={(e) => handleSelectChange("isActive", e.target.checked)}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {user.subscription ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-500">Plan</Label>
                        <Badge className={user.subscription.isActive ? 'bg-green-500' : 'bg-gray-400'}>
                          {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-500">Start Date</Label>
                        <span>{formatDateString(user.subscription.startDate)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-500">End Date</Label>
                        <span>{formatDateString(user.subscription.endDate)}</span>
                      </div>
                      
                      {user.subscription.nextDeliveryDate && (
                        <div className="flex justify-between">
                          <Label className="text-sm text-gray-500">Next Delivery</Label>
                          <span>{formatDateString(user.subscription.nextDeliveryDate)}</span>
                        </div>
                      )}
                      
                      {user.subscription.booksDelivered !== undefined && (
                        <div className="flex justify-between">
                          <Label className="text-sm text-gray-500">Books Delivered</Label>
                          <span>{user.subscription.booksDelivered}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-500">Status</Label>
                        <Badge variant="outline" className={user.subscription.isActive ? 'text-green-500 border-green-500' : 'text-gray-500 border-gray-500'}>
                          {user.subscription.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No active subscription
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="children">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="children" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Children</TabsTrigger>
          <TabsTrigger value="readingLogs" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Reading Logs</TabsTrigger>
          <TabsTrigger value="bookshelf" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Bookshelf</TabsTrigger>
        </TabsList>
        
        <TabsContent value="children" className="p-4 border rounded-lg mt-4">
          <h3 className="text-lg font-semibold mb-4">Children's Reading Details</h3>
          
          {user.readingLogs && user.readingLogs.length > 0 ? (
            <div className="space-y-6">
              <UserChildDetails 
                childId="child1"
                childName={`${user.name}'s Child`}
                readingLogs={user.readingLogs}
                booksRead={user.booksRead}
                age={10}
                readingLevel="Intermediate"
                favoriteGenres={['Adventure', 'Fantasy', 'Science']}
                readingTimeByDay={[
                  { day: 'Mon', minutes: 45 },
                  { day: 'Tue', minutes: 30 },
                  { day: 'Wed', minutes: 60 },
                  { day: 'Thu', minutes: 20 },
                  { day: 'Fri', minutes: 15 },
                  { day: 'Sat', minutes: 90 },
                  { day: 'Sun', minutes: 75 },
                ]}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No children's reading data found
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="readingLogs" className="p-4 border rounded-lg mt-4">
          <h3 className="text-lg font-semibold mb-4">Reading Activity</h3>
          
          {user.readingLogs && user.readingLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Book ID</TableHead>
                  <TableHead>Time Read (min)</TableHead>
                  <TableHead>Pages Read</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.readingLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDateString(log.date)}</TableCell>
                    <TableCell>{log.bookId}</TableCell>
                    <TableCell>{log.minutesRead}</TableCell>
                    <TableCell>{log.pagesRead}</TableCell>
                    <TableCell>{log.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No reading logs found
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bookshelf" className="p-4 border rounded-lg mt-4">
          <h3 className="text-lg font-semibold mb-4">User's Bookshelf</h3>
          
          {user.userBooks && user.userBooks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Date Started</TableHead>
                  <TableHead>Date Finished</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.userBooks.map(book => (
                  <TableRow key={book.id}>
                    <TableCell>{book.bookId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{book.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDateString(book.dateAdded)}</TableCell>
                    <TableCell>{formatDateString(book.dateStarted)}</TableCell>
                    <TableCell>{formatDateString(book.dateFinished)}</TableCell>
                    <TableCell>{book.rating || '-'}/5</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No books in user's bookshelf
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetailsView;
