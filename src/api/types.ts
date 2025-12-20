import type { ShoppingList, ShoppingItem, ListShare } from '../types';

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

export interface CreateShareRequest {
  telegramUsername: string;
}

// Backend returns plain types directly (not wrapped in objects)
export type ListsResponse = ShoppingList[];
export type ListResponse = ShoppingList;
export type ItemResponse = ShoppingItem;
export type ItemsResponse = ShoppingItem[];
export type ShareResponse = ListShare;
export type SharesResponse = ListShare[];
