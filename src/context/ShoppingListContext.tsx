import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ShoppingList, ShoppingItem } from '../types';
import { STORAGE_KEYS } from '../constants';

interface ShoppingListState {
  lists: ShoppingList[];
}

type ShoppingListAction =
  | { type: 'SET_LISTS'; payload: ShoppingList[] }
  | { type: 'ADD_LIST'; payload: ShoppingList }
  | { type: 'UPDATE_LIST'; payload: { id: string; updates: Partial<ShoppingList> } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'TOGGLE_DEFAULT'; payload: string }
  | { type: 'ADD_ITEM'; payload: { listId: string; item: ShoppingItem } }
  | { type: 'UPDATE_ITEM'; payload: { listId: string; itemId: string; updates: Partial<ShoppingItem> } }
  | { type: 'DELETE_ITEM'; payload: { listId: string; itemId: string } };

const initialState: ShoppingListState = {
  lists: [],
};

function shoppingListReducer(state: ShoppingListState, action: ShoppingListAction): ShoppingListState {
  switch (action.type) {
    case 'SET_LISTS':
      return { ...state, lists: action.payload };

    case 'ADD_LIST':
      return { ...state, lists: [...state.lists, action.payload] };

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

    default:
      return state;
  }
}

interface ShoppingListContextValue {
  state: ShoppingListState;
  addList: (name: string) => void;
  updateList: (id: string, updates: Partial<ShoppingList>) => void;
  deleteList: (id: string) => void;
  toggleDefault: (id: string) => void;
  addItem: (listId: string, name: string) => void;
  updateItem: (listId: string, itemId: string, updates: Partial<ShoppingItem>) => void;
  deleteItem: (listId: string, itemId: string) => void;
  shareList: (id: string) => string;
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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOPPING_LISTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ShoppingList[];
        const lists = parsed.map((list) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt),
          items: list.items.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          })),
        }));
        dispatch({ type: 'SET_LISTS', payload: lists });
      } catch (error) {
        console.error('Failed to load shopping lists:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOPPING_LISTS, JSON.stringify(state.lists));
  }, [state.lists]);

  const addList = (name: string) => {
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      sharedWith: 1,
    };
    dispatch({ type: 'ADD_LIST', payload: newList });
  };

  const updateList = (id: string, updates: Partial<ShoppingList>) => {
    dispatch({ type: 'UPDATE_LIST', payload: { id, updates } });
  };

  const deleteList = (id: string) => {
    dispatch({ type: 'DELETE_LIST', payload: id });
  };

  const toggleDefault = (id: string) => {
    dispatch({ type: 'TOGGLE_DEFAULT', payload: id });
  };

  const addItem = (listId: string, name: string) => {
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name,
      completed: false,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_ITEM', payload: { listId, item: newItem } });
  };

  const updateItem = (listId: string, itemId: string, updates: Partial<ShoppingItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { listId, itemId, updates } });
  };

  const deleteItem = (listId: string, itemId: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: { listId, itemId } });
  };

  const shareList = (id: string): string => {
    const shareId = crypto.randomUUID();
    updateList(id, { shareId });
    return `${window.location.origin}/shared/${shareId}`;
  };

  const value: ShoppingListContextValue = {
    state,
    addList,
    updateList,
    deleteList,
    toggleDefault,
    addItem,
    updateItem,
    deleteItem,
    shareList,
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
}