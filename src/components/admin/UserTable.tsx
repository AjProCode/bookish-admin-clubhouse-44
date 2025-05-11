
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Lock, Unlock, FileText } from 'lucide-react';
import { UserDetails } from '@/models/UserBook';

interface UserTableProps {
  users: UserDetails[];
  onEdit: (id: string) => void;
  onViewDetails: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  onEdit, 
  onViewDetails,
  onToggleStatus 
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Books Read</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.joinDate}</TableCell>
              <TableCell>
                <Badge 
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.status === 'active' ? 'outline' : 'secondary'}
                  className={user.status === 'active' ? 'border-green-500 text-green-500' : 'border-gray-400 text-gray-500'}
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>{user.booksRead}</TableCell>
              <TableCell>
                {user.subscription ? (
                  <Badge variant="outline" className="border-blue-500 text-blue-500">
                    {user.subscription.plan}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-400 text-gray-500">
                    none
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(user.id)}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(user.id)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(user.id)}>
                      {user.status === 'active' ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
