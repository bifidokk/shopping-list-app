import React from 'react';
import type { ShoppingList } from '../types';

interface ShoppingListItemProps {
  list: ShoppingList;
  isLast: boolean;
  isSingleList: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onToggleDefault: (id: string, e: React.MouseEvent) => void;
}

export const ShoppingListItem = React.memo(({ list, isLast, isSingleList, onSelect, onDelete, onToggleDefault }: ShoppingListItemProps) => {
  const completedCount = list.items.filter(item => item.completed).length;
  const totalCount = list.items.length;
  const isDefault = isSingleList || list.isDefault;

  return (
    <div
      onClick={() => onSelect(list.id)}
      className={`bg-white p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between ${
        !isLast ? 'border-b border-gray-100' : ''
      }`}
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-lg truncate">{list.name}</h3>
            <button
              onClick={(e) => onToggleDefault(list.id, e)}
              className="flex-shrink-0 p-1 hover:scale-110 transition-transform"
              disabled={isSingleList}
            >
              <svg
                className={`w-5 h-5 ${isDefault ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-500">
              {completedCount}/{totalCount} items
            </span>
            {totalCount > 1 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                <span>2</span>
              </div>
            )}
          </div>

          {totalCount > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
        </svg>
        <button
          onClick={(e) => onDelete(list.id, e)}
          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
});

ShoppingListItem.displayName = 'ShoppingListItem';
