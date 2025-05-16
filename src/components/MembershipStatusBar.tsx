
import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";

interface MembershipStatusBarProps {
  daysRemaining?: number;
  totalDays?: number;
}

const MembershipStatusBar: React.FC<MembershipStatusBarProps> = ({
  daysRemaining = 0,
  totalDays = 30,
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const calculateProgress = () => {
      // Handle case where daysRemaining or totalDays are 0
      if (totalDays <= 0) return 0;
      
      // Ensure daysRemaining is a number
      const days = typeof daysRemaining === 'string' ? parseInt(daysRemaining, 10) : daysRemaining;
      
      // Calculate percentage of days remaining
      const percentage = (days / totalDays) * 100;
      
      // Clamp percentage between 0 and 100
      return Math.max(0, Math.min(100, percentage));
    };
    
    // Calculate initial progress
    setProgress(calculateProgress());
  }, [daysRemaining, totalDays]);
  
  const formatDaysText = () => {
    // Ensure daysRemaining is a number
    const days = typeof daysRemaining === 'string' ? parseInt(daysRemaining, 10) : daysRemaining;
    
    if (days <= 0) return "Expired";
    if (days === 1) return "1 day remaining";
    return `${days} days remaining`;
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Membership Status</span>
        <span className="font-medium">{formatDaysText()}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default MembershipStatusBar;
