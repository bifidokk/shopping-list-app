import { apiClient } from './client';
import type {
  CreateListRequest,
  UpdateListRequest,
  CreateItemRequest,
  UpdateItemRequest,
  ListsResponse,
  ListResponse,
  ItemResponse,
  ItemsResponse,
} from './types';

export const shoppingListsApi = {
  // Shopping Lists endpoints
  getLists: () =>
    apiClient.get<ListsResponse>('/api/shopping-lists'),

  getList: (id: string) =>
    apiClient.get<ListResponse>(`/api/shopping-lists/${id}`),

  createList: (data: CreateListRequest) =>
    apiClient.post<ListResponse>('/api/shopping-lists', data),

  updateList: (id: string, data: UpdateListRequest) =>
    apiClient.patch<ListResponse>(`/api/shopping-lists/${id}`, data),

  deleteList: (id: string) =>
    apiClient.delete<void>(`/api/shopping-lists/${id}`),

  // Items endpoints
  getItems: (listId: string) =>
    apiClient.get<ItemsResponse>(`/api/shopping-lists/${listId}/items`),

  getItem: (listId: string, itemId: string) =>
    apiClient.get<ItemResponse>(`/api/shopping-lists/${listId}/items/${itemId}`),

  addItem: (listId: string, data: CreateItemRequest) =>
    apiClient.post<ItemResponse>(`/api/shopping-lists/${listId}/items`, data),

  updateItem: (listId: string, itemId: string, data: UpdateItemRequest) =>
    apiClient.patch<ItemResponse>(`/api/shopping-lists/${listId}/items/${itemId}`, data),

  deleteItem: (listId: string, itemId: string) =>
    apiClient.delete<void>(`/api/shopping-lists/${listId}/items/${itemId}`),

  toggleItem: (listId: string, itemId: string) =>
    apiClient.post<ItemResponse>(`/api/shopping-lists/${listId}/items/${itemId}/toggle`),
};
