
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdminCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  value,
  icon,
  trend,
  className
}) => {
  return (
    <Card className={cn("p-6 admin-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2 mb-1">{value}</h3>
          {trend && (
            <p className={cn(
              "text-xs flex items-center",
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span className="mr-1">
                {trend.isPositive ? '↑' : '↓'}
              </span>
              {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="bg-bookclub-accent p-3 rounded-full">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default AdminCard;
