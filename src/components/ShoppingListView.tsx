import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShoppingList } from '../context/ShoppingListContext';
import { ShoppingItemComponent } from './ShoppingItemComponent';
import { AddItemForm } from './AddItemForm';
import { StarFilledIcon, Share2Icon } from '@radix-ui/react-icons';
import { ShareListDialog } from './ShareListDialog';

export function ShoppingListView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, deleteList, updateList, fetchListItems } = useShoppingList();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const activeList = state.lists.find(list => list.id === Number(id));

  useEffect(() => {
    if (id) {
      fetchListItems(Number(id));
    }
  }, [id, fetchListItems]);

  if (!activeList) {
    return (
      <div className="text-center py-8 text-gray-500">
        List not found
      </div>
    );
  }

  const handleDelete = async () => {
    // Only allow owner to delete
    if (!activeList.isOwner) {
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
            await deleteList(activeList.id);
            navigate('/');
          } catch (error) {
            console.error('Failed to delete list:', error);
          }
        }
      });
    } else {
      if (confirm('Are you sure you want to delete this shopping list?')) {
        try {
          await deleteList(activeList.id);
          navigate('/');
        } catch (error) {
          console.error('Failed to delete list:', error);
        }
      }
    }
  };

  const handleEditName = () => {
    setNewName(activeList.name);
    setEditingName(true);
  };

  const handleSaveName = () => {
    if (newName.trim()) {
      updateList(activeList.id, { name: newName.trim() });
    }
    setEditingName(false);
  };

  const completedItems = activeList.items.filter(item => item.completed);
  const pendingItems = activeList.items.filter(item => !item.completed);

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0" style={{ paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top) + 1rem)' }}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 font-medium"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            {activeList.isOwner && (
              <button
                onClick={() => setShareDialogOpen(true)}
                className="flex items-center gap-1.5 text-blue-500 font-medium hover:text-blue-600"
              >
                <Share2Icon className="w-4 h-4" />
                Share
              </button>
            )}
            {activeList.isOwner && (
              <button
                onClick={handleDelete}
                className="text-red-500 font-medium hover:text-red-600"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {editingName ? (
          <div className="flex space-x-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setEditingName(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1
              onClick={handleEditName}
              className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-500"
            >
              {activeList.name}
            </h1>
            {activeList.isDefault && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex-shrink-0">
                <StarFilledIcon className="w-3 h-3" />
                <span>Default</span>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-500 mt-1">
          {activeList.items.length} items • {completedItems.length} completed
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-8">
          <AddItemForm listId={activeList.id} />

          <div className="space-y-4 mt-6">
            {pendingItems.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">To Buy</h3>
                <div className="space-y-2">
                  {pendingItems.map(item => (
                    <ShoppingItemComponent
                      key={item.id}
                      item={item}
                      listId={activeList.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedItems.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Completed</h3>
                <div className="space-y-2">
                  {completedItems.map(item => (
                    <ShoppingItemComponent
                      key={item.id}
                      item={item}
                      listId={activeList.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeList.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items yet. Add your first item above!
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareListDialog
        list={activeList}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
}
