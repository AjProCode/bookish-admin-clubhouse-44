
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  Users,
  Settings,
  ChevronRight,
  Menu,
  X,
  BadgeDollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, isActive, onClick }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
        isActive 
          ? "bg-bookclub-primary text-white" 
          : "text-gray-700 hover:bg-bookclub-accent hover:text-bookclub-primary"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
    </Link>
  );
};

interface AdminSidebarProps {
  className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  const sidebarItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      to: '/admin',
    },
    {
      icon: <Library className="h-5 w-5" />,
      label: 'Books',
      to: '/admin/books',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Users',
      to: '/admin/users',
    },
    {
      icon: <BadgeDollarSign className="h-5 w-5" />,
      label: 'Membership Plans',
      to: '/admin/membership-plans',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      to: '/admin/settings',
    }
  ];
  
  const isItemActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    <>
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-40"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300",
          isMobile ? "fixed top-0 left-0 z-50 w-64 shadow-xl transform" : "w-64 min-w-64",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0",
          className
        )}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2" onClick={closeSidebar}>
            <div className="bg-bookclub-primary text-white h-8 w-8 rounded-md flex items-center justify-center font-bold">
              SB
            </div>
            <span className="font-serif font-semibold text-lg">Admin Panel</span>
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={isItemActive(item.to)}
              onClick={closeSidebar}
            />
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-bookclub-primary"
            onClick={closeSidebar}
          >
            <span>← Back to Main Site</span>
          </Link>
        </div>
      </aside>
      
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default AdminSidebar;
