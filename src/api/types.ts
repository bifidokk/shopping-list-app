import type { ShoppingList, ShoppingItem } from '../types';

export interface CreateListRequest {
  name: string;
}

export interface UpdateListRequest {
  name?: string;
  isDefault?: boolean;
  shareId?: string;
  sharedWith?: number;
}

export interface CreateItemRequest {
  name: string;
}

export interface UpdateItemRequest {
  name?: string;
  completed?: boolean;
}

// Backend returns plain types directly (not wrapped in objects)
export type ListsResponse = ShoppingList[];
export type ListResponse = ShoppingList;
export type ItemResponse = ShoppingItem;
export type ItemsResponse = ShoppingItem[];
