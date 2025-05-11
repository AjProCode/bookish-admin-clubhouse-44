
export type ReadingStatus = "want_to_read" | "reading" | "completed" | "dnf";
export type SubscriptionPlan = "monthly" | "quarterly" | "biannual" | "annual" | "none";

export interface UserBook {
  id: string;
  bookId: string;
  userId: string;
  status: ReadingStatus;
  dateAdded: string;
  dateStarted?: string;
  dateFinished?: string;
  pagesRead?: number;
  rating?: number;
  review?: string;
  notes?: string;
  isFavorite: boolean;
}

export interface BookshelfFilters {
  status?: ReadingStatus | "all";
  favorite?: boolean;
  searchQuery?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  isActive: boolean;
  nextDeliveryDate?: string;
  booksDelivered?: number;
}

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  booksRead: number;
  subscription?: UserSubscription;
  readingLogs?: UserReadingLog[];
  userBooks?: UserBook[];
}

export interface UserReadingLog {
  id: string;
  userId: string;
  bookId: string;
  date: string;
  minutesRead: number;
  pagesRead: number;
  notes?: string;
}
