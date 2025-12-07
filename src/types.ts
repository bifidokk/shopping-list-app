export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  createdAt: Date;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
  shareId?: string;
  isDefault?: boolean;
  sharedWith?: number;
}
