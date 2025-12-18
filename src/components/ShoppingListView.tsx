import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShoppingList } from '../context/ShoppingListContext';
import { ShoppingItemComponent } from './ShoppingItemComponent';
import { AddItemForm } from './AddItemForm';

export function ShoppingListView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, deleteList, updateList } = useShoppingList();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const activeList = state.lists.find(list => list.id === Number(id));

  if (!activeList) {
    return (
      <div className="text-center py-8 text-gray-500">
        List not found
      </div>
    );
  }

  const handleDelete = () => {
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
          deleteList(activeList.id);
          navigate('/');
        }
      });
    } else {
      if (confirm('Are you sure you want to delete this shopping list?')) {
        deleteList(activeList.id);
        navigate('/');
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
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 font-medium"
          >
            ← Back
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 font-medium"
          >
            Delete
          </button>
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
          <h1
            onClick={handleEditName}
            className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-500"
          >
            {activeList.name}
          </h1>
        )}

        <div className="text-sm text-gray-500 mt-1">
          {activeList.items.length} items • {completedItems.length} completed
        </div>
      </div>

      <div className="p-4">
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
  );
}
