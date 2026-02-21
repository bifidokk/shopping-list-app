import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShoppingList } from '../context/ShoppingListContext';
import { ShoppingListForm } from './ShoppingListForm';
import { ShoppingListItem } from './ShoppingListItem';
import { EmptyState } from './EmptyState';

export function ShoppingListGrid() {
  const navigate = useNavigate();
  const { state, addList, deleteList, setDefaultList } = useShoppingList();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddList = (name: string) => {
    addList(name);
    setShowAddForm(false);
  };

  const handleToggleDefault = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const list = state.lists.find(l => l.id === listId);
    if (!list) return;

    // Only call API if setting as default (not unsetting)
    if (!list.isDefault) {
      try {
        await setDefaultList(listId);
      } catch (error) {
        console.error('Failed to set default list:', error);
      }
    }
  };

  const handleDeleteList = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if user is the owner
    const list = state.lists.find(l => l.id === listId);
    if (!list?.isOwner) {
      console.error('Only the owner can delete this list');
      return;
    }

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showPopup({
        title: 'Delete List',
        message: 'Are you sure you want to delete this shopping list?',
        buttons: [
          {
            id: 'delete',
            type: 'destructive',
            text: 'Delete',
          },
          {
            id: 'cancel',
            type: 'cancel',
            text: 'Cancel',
          },
        ],
      }, async (buttonId) => {
        if (buttonId === 'delete') {
          try {
            await deleteList(listId);
          } catch (error) {
            console.error('Failed to delete list:', error);
          }
        }
      });
    } else {
      if (confirm('Are you sure you want to delete this shopping list?')) {
        try {
          await deleteList(listId);
        } catch (error) {
          console.error('Failed to delete list:', error);
        }
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col">
      <div className="bg-blue-500 p-4 flex-shrink-0" style={{ paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top) + 1rem)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">Shopping Lists</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <div className="px-4 py-6 pb-20">
        {showAddForm && (
          <ShoppingListForm
            onSubmit={handleAddList}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {state.lists.length === 0 ? (
          !showAddForm && <EmptyState onCreateFirst={() => setShowAddForm(true)} />
        ) : (
          <div className="space-y-0">
            {[...state.lists]
              .sort((a, b) => {
                // Sort default list to the top
                if (a.isDefault && !b.isDefault) return -1;
                if (!a.isDefault && b.isDefault) return 1;
                return 0;
              })
              .map((list, index, sortedArray) => (
                <ShoppingListItem
                  key={list.id}
                  list={list}
                  isLast={index === sortedArray.length - 1}
                  isSingleList={sortedArray.length === 1}
                  onSelect={(id) => navigate(`/list/${id}`)}
                  onDelete={handleDeleteList}
                  onToggleDefault={handleToggleDefault}
                />
              ))}
          </div>
        )}

        </div>

        {!showAddForm && state.lists.length > 0 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
