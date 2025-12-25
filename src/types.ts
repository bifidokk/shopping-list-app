export interface ShoppingItem {
  id: number;
  name: string;
  completed: boolean;
  createdAt: Date;
}

export interface ListShare {
  id: number;
  listId: number;
  ownerId: number;
  sharedWithUserId: number;
  sharedWithUsername?: string;
  sharedWithFirstName?: string;
  sharedWithLastName?: string;
  createdAt: Date;
}

export interface ShoppingList {
  id: number;
  name: string;
  description?: string | null;
  items: ShoppingItem[];
  totalItems?: number;
  completedItems?: number;
  createdAt: Date;
  updatedAt: Date;
  shareId?: string;
  isDefault?: boolean;
  ownerId?: number;
  isOwner?: boolean;
  sharedWith?: number;
  shares?: ListShare[];
}

// API Response Types (from backend with string dates)
export interface ApiShoppingItemResponse {
  id: number | string;
  name: string;
  isDone?: boolean;
  completed?: boolean;
  createdAt: string;
}

export interface ApiListShareResponse {
  id: number | string;
  listId: number | string;
  ownerId: number | string;
  sharedWithUserId: number | string;
  sharedWithUsername?: string;
  sharedWithFirstName?: string;
  sharedWithLastName?: string;
  createdAt: string;
}

export interface ApiShoppingListResponse {
  id: number | string;
  name: string;
  description?: string | null;
  items?: ApiShoppingItemResponse[];
  totalItems?: number;
  completedItems?: number;
  createdAt: string;
  updatedAt: string;
  shareId?: string;
  isDefault?: boolean;
  ownerId?: number;
  isOwner?: boolean;
  sharedWith?: number;
  shares?: ApiListShareResponse[];
}
