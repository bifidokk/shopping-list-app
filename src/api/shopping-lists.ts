import { apiClient } from './client';
import type {
  CreateListRequest,
  UpdateListRequest,
  CreateItemRequest,
  UpdateItemRequest,
  ListsResponse,
  ListResponse,
  ItemResponse,
  ShareListResponse,
} from './types';

export const shoppingListsApi = {
  getLists: () =>
    apiClient.get<ListsResponse>('/lists'),

  getList: (id: string) =>
    apiClient.get<ListResponse>(`/lists/${id}`),

  createList: (data: CreateListRequest) =>
    apiClient.post<ListResponse>('/lists', data),

  updateList: (id: string, data: UpdateListRequest) =>
    apiClient.patch<ListResponse>(`/lists/${id}`, data),

  deleteList: (id: string) =>
    apiClient.delete<void>(`/lists/${id}`),

  shareList: (id: string) =>
    apiClient.post<ShareListResponse>(`/lists/${id}/share`),

  toggleDefault: (id: string) =>
    apiClient.post<ListResponse>(`/lists/${id}/toggle-default`),

  addItem: (listId: string, data: CreateItemRequest) =>
    apiClient.post<ItemResponse>(`/lists/${listId}/items`, data),

  updateItem: (listId: string, itemId: string, data: UpdateItemRequest) =>
    apiClient.patch<ItemResponse>(`/lists/${listId}/items/${itemId}`, data),

  deleteItem: (listId: string, itemId: string) =>
    apiClient.delete<void>(`/lists/${listId}/items/${itemId}`),
};
