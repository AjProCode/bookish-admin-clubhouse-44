
import React from 'react';
import { Line, Bar } from 'recharts';
import { 
  Library,
  Users,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminCard from '@/components/admin/AdminCard';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart
} from 'recharts';

// Sample data for charts
const monthlyData = [
  { month: 'Jan', users: 10, books: 15, sessions: 45 },
  { month: 'Feb', users: 15, books: 18, sessions: 52 },
  { month: 'Mar', users: 20, books: 22, sessions: 65 },
  { month: 'Apr', users: 25, books: 25, sessions: 80 },
  { month: 'May', users: 32, books: 30, sessions: 95 },
  { month: 'Jun', users: 38, books: 32, sessions: 110 },
];

const categoryData = [
  { name: 'Business', value: 30 },
  { name: 'Psychology', value: 25 },
  { name: 'Self-Help', value: 20 },
  { name: 'Finance', value: 15 },
  { name: 'Science', value: 10 },
  { name: 'Others', value: 5 },
];

// Sample recent activity data
const recentActivity = [
  { id: 1, user: 'John Doe', action: 'Added a new book', item: 'The Lean Startup', time: '2 hours ago' },
  { id: 2, user: 'Jane Smith', action: 'Joined the club', item: '', time: '5 hours ago' },
  { id: 3, user: 'Mike Johnson', action: 'Reviewed', item: 'Atomic Habits', time: '1 day ago' },
  { id: 4, user: 'Sarah Williams', action: 'Completed reading', item: 'Deep Work', time: '2 days ago' },
  { id: 5, user: 'Alex Brown', action: 'Started reading', item: 'Thinking, Fast and Slow', time: '2 days ago' },
];

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Dashboard" />
      
      <div className="p-6 space-y-8 flex-1 overflow-y-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminCard
            title="Total Books"
            value="254"
            icon={<Library className="h-6 w-6 text-bookclub-primary" />}
            trend={{ value: 12, isPositive: true }}
          />
          <AdminCard
            title="Active Users"
            value="185"
            icon={<Users className="h-6 w-6 text-bookclub-primary" />}
            trend={{ value: 8, isPositive: true }}
          />
          <AdminCard
            title="Books Read"
            value="895"
            icon={<BookOpen className="h-6 w-6 text-bookclub-primary" />}
            trend={{ value: 5, isPositive: true }}
          />
          <AdminCard
            title="Monthly Growth"
            value="24%"
            icon={<TrendingUp className="h-6 w-6 text-bookclub-primary" />}
            trend={{ value: 3, isPositive: true }}
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>Monthly user and book activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#7E69AB" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="books" 
                      stroke="#FEC6A1" 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="#2196F3" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Popular Categories Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>Distribution of book categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#7E69AB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions from users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.user}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{activity.item}</TableCell>
                    <TableCell>{activity.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
