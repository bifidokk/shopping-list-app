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
