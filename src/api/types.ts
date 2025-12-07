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

export interface ListsResponse {
  lists: ShoppingList[];
}

export interface ListResponse {
  list: ShoppingList;
}

export interface ItemResponse {
  item: ShoppingItem;
}

export interface ShareListResponse {
  shareUrl: string;
  shareId: string;
}
