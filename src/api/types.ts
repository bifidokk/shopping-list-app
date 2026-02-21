import type { ApiShoppingListResponse, ApiShoppingItemResponse, ApiListShareResponse } from '../types';

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

// Backend returns JSON with string dates, not parsed Date objects
export type ListsResponse = ApiShoppingListResponse[];
export type ListResponse = ApiShoppingListResponse;
export type ItemResponse = ApiShoppingItemResponse;
export type ItemsResponse = ApiShoppingItemResponse[];
export type ShareResponse = ApiListShareResponse;
export type SharesResponse = ApiListShareResponse[];
