import React from 'react';
import { DropdownMenu, IconButton } from '@radix-ui/themes';
import { DotsVerticalIcon, TrashIcon } from '@radix-ui/react-icons';
import type { ShoppingList } from '../types';

interface ShoppingListItemProps {
  list: ShoppingList;
  isLast: boolean;
  isSingleList: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}

export const ShoppingListItem = React.memo(({ list, isLast, onSelect, onDelete }: ShoppingListItemProps) => {
  const completedCount = list.items.filter(item => item.completed).length;
  const totalCount = list.items.length;

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
          </div>

          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-500">
              {completedCount}/{totalCount} items
            </span>
            {list.sharedWith && list.sharedWith > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
                <span>{list.sharedWith}</span>
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
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton
              variant="ghost"
              color="gray"
              size="2"
              onClick={(e) => e.stopPropagation()}
            >
              <DotsVerticalIcon />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item color="red" onClick={(e) => {
              e.stopPropagation();
              onDelete(list.id, e as unknown as React.MouseEvent);
            }}>
              <TrashIcon /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
});

ShoppingListItem.displayName = 'ShoppingListItem';
