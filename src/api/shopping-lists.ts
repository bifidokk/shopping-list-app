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

  getList: (id: number) =>
    apiClient.get<ListResponse>(`/api/shopping-lists/${id}`),

  createList: (data: CreateListRequest) =>
    apiClient.post<ListResponse>('/api/shopping-lists', data),

  updateList: (id: number, data: UpdateListRequest) =>
    apiClient.patch<ListResponse>(`/api/shopping-lists/${id}`, data),

  deleteList: (id: number) =>
    apiClient.delete<void>(`/api/shopping-lists/${id}`),

  setDefaultList: (id: number) =>
    apiClient.post<ListResponse>(`/api/shopping-lists/${id}/set-default`),

  // Items endpoints
  getItems: (listId: number) =>
    apiClient.get<ItemsResponse>(`/api/shopping-lists/${listId}/items`),

  getItem: (listId: number, itemId: number) =>
    apiClient.get<ItemResponse>(`/api/shopping-lists/${listId}/items/${itemId}`),

  addItem: (listId: number, data: CreateItemRequest) =>
    apiClient.post<ItemResponse>(`/api/shopping-lists/${listId}/items`, data),

  updateItem: (listId: number, itemId: number, data: UpdateItemRequest) =>
    apiClient.patch<ItemResponse>(`/api/shopping-lists/${listId}/items/${itemId}`, data),

  deleteItem: (listId: number, itemId: number) =>
    apiClient.delete<void>(`/api/shopping-lists/${listId}/items/${itemId}`),

  toggleItem: (listId: number, itemId: number) =>
    apiClient.post<ItemResponse>(`/api/shopping-lists/${listId}/items/${itemId}/toggle`),
};
