export interface ShoppingItem {
  id: number;
  name: string;
  completed: boolean;
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
  sharedWith?: number;
}
