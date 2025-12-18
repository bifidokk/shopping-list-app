import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
      const lists = response.map((list) => ({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt),
        items: (list.items || []).map((item) => ({
          ...item,
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

  useEffect(() => {
    refreshLists();
  }, []);

  const addList = async (name: string) => {
    try {
      const response = await shoppingListsApi.createList({ name });
      // Backend returns plain object directly
      const list = {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        items: (response.items || []).map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })),
      };
      dispatch({ type: 'ADD_LIST', payload: list });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create list';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const updateList = async (id: number, updates: Partial<ShoppingList>) => {
    try {
      await shoppingListsApi.updateList(id, updates);
      dispatch({ type: 'UPDATE_LIST', payload: { id, updates } });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update list';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const deleteList = async (id: number) => {
    try {
      await shoppingListsApi.deleteList(id);
      dispatch({ type: 'DELETE_LIST', payload: id });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete list';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const toggleItem = async (listId: number, itemId: number) => {
    try {
      const response = await shoppingListsApi.toggleItem(listId, itemId);
      // Backend returns plain object directly
      const item = {
        ...response,
        createdAt: new Date(response.createdAt),
      };
      dispatch({ type: 'UPDATE_ITEM', payload: { listId, itemId, updates: { completed: item.completed } } });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to toggle item';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const addItem = async (listId: number, name: string) => {
    try {
      const response = await shoppingListsApi.addItem(listId, { name });
      // Backend returns plain object directly
      const item = {
        ...response,
        createdAt: new Date(response.createdAt),
      };
      dispatch({ type: 'ADD_ITEM', payload: { listId, item } });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to add item';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const updateItem = async (listId: number, itemId: number, updates: Partial<ShoppingItem>) => {
    try {
      await shoppingListsApi.updateItem(listId, itemId, updates);
      dispatch({ type: 'UPDATE_ITEM', payload: { listId, itemId, updates } });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update item';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const deleteItem = async (listId: number, itemId: number) => {
    try {
      await shoppingListsApi.deleteItem(listId, itemId);
      dispatch({ type: 'DELETE_ITEM', payload: { listId, itemId } });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete item';
      dispatch({ type: 'SET_ERROR', payload: message });
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
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
}
