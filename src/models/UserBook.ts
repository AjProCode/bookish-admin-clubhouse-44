
export type ReadingStatus = "want_to_read" | "reading" | "completed" | "dnf";

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
