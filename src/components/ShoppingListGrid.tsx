import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShoppingList } from '../context/ShoppingListContext';
import { ShoppingListForm } from './ShoppingListForm';
import { ShoppingListItem } from './ShoppingListItem';
import { EmptyState } from './EmptyState';

export function ShoppingListGrid() {
  const navigate = useNavigate();
  const { state, addList, deleteList, toggleDefault, shareList } = useShoppingList();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddList = (name: string) => {
    addList(name);
    setShowAddForm(false);
  };

  const handleToggleDefault = (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleDefault(listId);
  };

  const handleDeleteList = (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showPopup({
        title: 'Delete List',
        message: 'Are you sure you want to delete this shopping list?',
        buttons: [
          {
            type: 'destructive',
            text: 'Delete',
          },
          {
            type: 'cancel',
            text: 'Cancel',
          },
        ],
      }, (buttonId) => {
        if (buttonId === 'destructive') {
          deleteList(listId);
        }
      });
    } else {
      if (confirm('Are you sure you want to delete this shopping list?')) {
        deleteList(listId);
      }
    }
  };

  const handleShareList = (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = shareList(listId);
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showPopup({
        title: 'Share List',
        message: 'Share this shopping list with friends!',
        buttons: [
          {
            type: 'default',
            text: 'Copy Link',
          },
          {
            type: 'close',
            text: 'Close',
          },
        ],
      });
      navigator.clipboard.writeText(shareUrl);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col">
      <div className="bg-blue-500 p-4 flex-shrink-0">
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
            {state.lists.map((list, index) => (
              <ShoppingListItem
                key={list.id}
                list={list}
                isLast={index === state.lists.length - 1}
                isSingleList={state.lists.length === 1}
                onSelect={(id) => navigate(`/list/${id}`)}
                onDelete={handleDeleteList}
                onShare={handleShareList}
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
