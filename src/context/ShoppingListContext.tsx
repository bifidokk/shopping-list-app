import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ShoppingList, ShoppingItem } from '../types';
import { shoppingListsApi } from '../api/shopping-lists';
import { ApiError } from '../api/client';

interface ShoppingListState {
  lists: ShoppingList[];
  loading: boolean;
  error: string | null;
}

type ShoppingListAction =
  | { type: 'SET_LISTS'; payload: ShoppingList[] }
  | { type: 'ADD_LIST'; payload: ShoppingList }
  | { type: 'UPDATE_LIST'; payload: { id: number; updates: Partial<ShoppingList> } }
  | { type: 'DELETE_LIST'; payload: number }
  | { type: 'TOGGLE_DEFAULT'; payload: number }
  | { type: 'SET_LIST_ITEMS'; payload: { listId: number; items: ShoppingItem[] } }
  | { type: 'ADD_ITEM'; payload: { listId: number; item: ShoppingItem } }
  | { type: 'UPDATE_ITEM'; payload: { listId: number; itemId: number; updates: Partial<ShoppingItem> } }
  | { type: 'DELETE_ITEM'; payload: { listId: number; itemId: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ShoppingListState = {
  lists: [],
  loading: false,
  error: null,
};

function shoppingListReducer(state: ShoppingListState, action: ShoppingListAction): ShoppingListState {
  switch (action.type) {
    case 'SET_LISTS':
      return { ...state, lists: action.payload };

    case 'ADD_LIST':
      return { ...state, lists: [action.payload, ...state.lists] };

    case 'UPDATE_LIST':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.id
            ? { ...list, ...action.payload.updates, updatedAt: new Date() }
            : list
        ),
      };

    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload),
      };

    case 'TOGGLE_DEFAULT':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload
            ? { ...list, isDefault: !list.isDefault }
            : { ...list, isDefault: false }
        ),
      };

    case 'SET_LIST_ITEMS':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? { ...list, items: action.payload.items }
            : list
        ),
      };

    case 'ADD_ITEM':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? { ...list, items: [...list.items, action.payload.item], updatedAt: new Date() }
            : list
        ),
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? {
                ...list,
                items: list.items.map(item =>
                  item.id === action.payload.itemId
                    ? { ...item, ...action.payload.updates }
                    : item
                ),
                updatedAt: new Date(),
              }
            : list
        ),
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? {
                ...list,
                items: list.items.filter(item => item.id !== action.payload.itemId),
                updatedAt: new Date(),
              }
            : list
        ),
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

interface ShoppingListContextValue {
  state: ShoppingListState;
  addList: (name: string) => Promise<void>;
  updateList: (id: number, updates: Partial<ShoppingList>) => Promise<void>;
  deleteList: (id: number) => Promise<void>;
  addItem: (listId: number, name: string) => Promise<void>;
  updateItem: (listId: number, itemId: number, updates: Partial<ShoppingItem>) => Promise<void>;
  deleteItem: (listId: number, itemId: number) => Promise<void>;
  toggleItem: (listId: number, itemId: number) => Promise<void>;
  refreshLists: () => Promise<void>;
  fetchListItems: (listId: number) => Promise<void>;
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
};

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(shoppingListReducer, initialState);

  const refreshLists = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await shoppingListsApi.getLists();
      // Backend returns plain array directly
      const lists = response.map((list: any) => ({
        ...list,
        id: Number(list.id),
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt),
        items: (list.items || []).map((item: any) => ({
          ...item,
          id: Number(item.id),
          completed: item.isDone ?? item.completed ?? false,
          createdAt: new Date(item.createdAt),
        })),
      }));
      dispatch({ type: 'SET_LISTS', payload: lists });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to load shopping lists';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Failed to load shopping lists:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchListItems = useCallback(async (listId: number) => {
    try {
      const response = await shoppingListsApi.getItems(listId);
      // Backend returns plain array directly
      const items = response.map((item: any) => ({
        ...item,
        id: Number(item.id),
        completed: item.isDone ?? item.completed ?? false,
        createdAt: new Date(item.createdAt),
      }));
      dispatch({ type: 'SET_LIST_ITEMS', payload: { listId, items } });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to load items';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Failed to load items:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    refreshLists();
  }, []);

  const addList = async (name: string) => {
    // Optimistic update: create temporary list with negative ID
    const tempId = -Date.now();
    const tempList = {
      id: tempId,
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Immediately add to UI
    dispatch({ type: 'ADD_LIST', payload: tempList });

    try {
      const response: any = await shoppingListsApi.createList({ name });
      // Backend returns plain object directly
      const list = {
        ...response,
        id: Number(response.id),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        items: (response.items || []).map((item: any) => ({
          ...item,
          id: Number(item.id),
          completed: item.isDone ?? item.completed ?? false,
          createdAt: new Date(item.createdAt),
        })),
      };

      // Replace temporary list with real list from server
      dispatch({ type: 'DELETE_LIST', payload: tempId });
      dispatch({ type: 'ADD_LIST', payload: list });
    } catch (error) {
      // Rollback: remove temporary list
      dispatch({ type: 'DELETE_LIST', payload: tempId });
      const message = error instanceof ApiError ? error.message : 'Failed to create list';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Failed to create list:', error);
      throw error;
    }
  };

  const updateList = async (id: number, updates: Partial<ShoppingList>) => {
    // Optimistic update: save previous state
    const list = state.lists.find(l => l.id === id);
    if (!list) {
      console.error('List not found');
      return;
    }

    const previousList = { ...list };

    // Immediately update UI
    dispatch({ type: 'UPDATE_LIST', payload: { id, updates } });

    try {
      await shoppingListsApi.updateList(id, updates);
    } catch (error) {
      // Rollback: restore previous state
      dispatch({ type: 'UPDATE_LIST', payload: { id, updates: previousList } });
      const message = error instanceof ApiError ? error.message : 'Failed to update list';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Failed to update list:', error);
      throw error;
    }
  };

  const deleteList = async (id: number) => {
    // Optimistic update: save the list before deleting
    const listToDelete = state.lists.find(list => list.id === id);
    if (!listToDelete) {
      console.error('List not found');
      return;
    }

    // Immediately update UI
    dispatch({ type: 'DELETE_LIST', payload: id });

    try {
      await shoppingListsApi.deleteList(id);
    } catch (error) {
      // Rollback: restore the deleted list
      dispatch({ type: 'ADD_LIST', payload: listToDelete });
      const message = error instanceof ApiError ? error.message : 'Failed to delete list';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Failed to delete list:', error);
      throw error;
    }
  };

  const toggleItem = async (listId: number, itemId: number) => {
    // Optimistic update: get current state and toggle it
    const list = state.lists.find(l => l.id === listId);
    const item = list?.items.find(i => i.id === itemId);
    if (!item) {
      console.error('Item not found');
      return;
    }

    const previousCompleted = item.completed;
    const newCompleted = !previousCompleted;

    // Immediately update UI
    dispatch({ type: 'UPDATE_ITEM', payload: { listId, itemId, updates: { completed: newCompleted } } });

    try {
      const response: any = await shoppingListsApi.toggleItem(listId, itemId);
      // Backend returns plain object directly
      const updatedItem = {
        ...response,
        id: Number(response.id),
        completed: response.isDone ?? response.completed ?? false,
        createdAt: new Date(response.createdAt),
      };
      // Update with server response to ensure sync
      dispatch({ type: 'UPDATE_ITEM', payload: { listId, itemId, updates: { completed: updatedItem.completed } } });
    } catch (error) {
      // Rollback: restore previous state
      dispatch({ type: 'UPDATE_ITEM', payload: { listId, itemId, updates: { completed: previousCompleted } } });
      const message = error instanceof ApiError ? error.message : 'Failed to toggle item';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Failed to toggle item:', error);
      throw error;
    }
  };

  const addItem = async (listId: number, name: string) => {
    // Optimistic update: create temporary item with negative ID
    const tempId = -Date.now(); // Temporary negative ID
    const tempItem = {
      id: tempId,
      name,
      completed: false,
      createdAt: new Date(),
    };

    // Immediately add to UI
    dispatch({ type: 'ADD_ITEM', payload: { listId, item: tempItem } });

    try {
      const response: any = await shoppingListsApi.addItem(listId, { name });
      // Backend returns plain object directly
      const item = {
        ...response,
        id: Number(response.id),
        completed: response.isDone ?? response.completed ?? false,
        createdAt: new Date(response.createdAt),
      };

      // Replace temporary item with real item from server
      dispatch({ type: 'DELETE_ITEM', payload: { listId, itemId: tempId } });
      dispatch({ type: 'ADD_ITEM', payload: { listId, item } });
    } catch (error) {
      // Rollback: remove temporary item
      dispatch({ type: 'DELETE_ITEM', payload: { listId, itemId: tempId } });
      const message = error instanceof ApiError ? error.message : 'Failed to add item';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Failed to add item:', error);
      throw error;
    }
  };

  const updateItem = async (listId: number, itemId: number, updates: Partial<ShoppingItem>) => {
    // Optimistic update: save previous state
    const list = state.lists.find(l => l.id === listId);
    const item = list?.items.find(i => i.id === itemId);
    if (!item) {
      console.error('Item not found');
      return;
    }

    const previousItem = { ...item };

    // Immediately update UI
    dispatch({ type: 'UPDATE_ITEM', payload: { listId, itemId, updates } });

    try {
      await shoppingListsApi.updateItem(listId, itemId, updates);
    } catch (error) {
      // Rollback: restore previous state
      dispatch({ type: 'UPDATE_ITEM', payload: { listId, itemId, updates: previousItem } });
      const message = error instanceof ApiError ? error.message : 'Failed to update item';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Failed to update item:', error);
      throw error;
    }
  };

  const deleteItem = async (listId: number, itemId: number) => {
    // Optimistic update: save the item before deleting
    const list = state.lists.find(l => l.id === listId);
    const itemToDelete = list?.items.find(item => item.id === itemId);
    if (!itemToDelete) {
      console.error('Item not found');
      return;
    }

    // Immediately update UI
    dispatch({ type: 'DELETE_ITEM', payload: { listId, itemId } });

    try {
      await shoppingListsApi.deleteItem(listId, itemId);
    } catch (error) {
      // Rollback: restore the deleted item
      dispatch({ type: 'ADD_ITEM', payload: { listId, item: itemToDelete } });
      const message = error instanceof ApiError ? error.message : 'Failed to delete item';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Failed to delete item:', error);
      throw error;
    }
  };

  const value: ShoppingListContextValue = {
    state,
    addList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
    toggleItem,
    refreshLists,
    fetchListItems,
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
}
