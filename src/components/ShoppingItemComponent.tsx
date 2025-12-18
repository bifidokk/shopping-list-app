import React, { useState } from 'react';
import { Checkbox, TextField, Button, Flex, Text, IconButton } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useShoppingList } from '../context/ShoppingListContext';
import type { ShoppingItem } from '../types';
import { useTelegramHaptics } from '../utils/telegram';

interface ShoppingItemComponentProps {
  item: ShoppingItem;
  listId: number;
}

export const ShoppingItemComponent = React.memo(({ item, listId }: ShoppingItemComponentProps) => {
  const { updateItem, deleteItem, toggleItem } = useShoppingList();
  const { impact, notification } = useTelegramHaptics();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const handleToggleComplete = () => {
    toggleItem(listId, item.id);
    impact('light');
    if (!item.completed) {
      notification('success');
    }
  };

  const handleEdit = () => {
    setEditName(item.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim()) {
      updateItem(listId, item.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(item.name);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteItem(listId, item.id);
    impact('medium');
  };

  return (
    <Flex align="center" gap="3" className={`p-3 bg-gray-50 rounded-lg ${item.completed ? 'opacity-60' : ''}`}>
      <Checkbox
        checked={item.completed}
        onCheckedChange={handleToggleComplete}
        size="2"
      />

      {isEditing ? (
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <TextField.Root
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            size="2"
            autoFocus
          />
          <Flex gap="2">
            <Button
              onClick={handleSave}
              size="1"
              style={{ flex: 1 }}
            >
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="soft"
              color="gray"
              size="1"
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Flex align="center" justify="between" style={{ flex: 1 }}>
          <Text
            className={`cursor-pointer ${item.completed ? 'line-through' : ''}`}
            color={item.completed ? 'gray' : undefined}
            onClick={handleEdit}
          >
            {item.name}
          </Text>
          <IconButton
            onClick={handleDelete}
            variant="ghost"
            color="red"
            size="1"
          >
            <Cross2Icon />
          </IconButton>
        </Flex>
      )}
    </Flex>
  );
});

ShoppingItemComponent.displayName = 'ShoppingItemComponent';