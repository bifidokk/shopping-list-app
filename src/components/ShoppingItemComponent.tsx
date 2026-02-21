import React, { useState } from 'react';
import { Checkbox, TextField, Button, Flex, Text, IconButton } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useShoppingList } from '../context/ShoppingListContext';
import type { ShoppingItem } from '../types';
import { useTelegramHaptics } from '../utils/telegram';

const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

function generateParticles() {
  return Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360 + (Math.random() * 30 - 15);
    const distance = 20 + Math.random() * 25;
    const rad = (angle * Math.PI) / 180;
    return {
      id: i,
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.1,
    };
  });
}

interface ShoppingItemComponentProps {
  item: ShoppingItem;
  listId: number;
}

export const ShoppingItemComponent = React.memo(({ item, listId }: ShoppingItemComponentProps) => {
  const { updateItem, deleteItem, toggleItem } = useShoppingList();
  const { impact, notification } = useTelegramHaptics();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);

  const handleToggleComplete = () => {
    if (!item.completed) {
      setParticles(generateParticles());
      notification('success');
      impact('light');
      // Delay the toggle so confetti plays before the item moves to the Completed section
      setTimeout(() => {
        toggleItem(listId, item.id);
      }, 500);
    } else {
      toggleItem(listId, item.id);
      impact('light');
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
    <Flex align="center" gap="3" className={`p-3 bg-gray-50 rounded-lg overflow-visible ${item.completed ? 'opacity-60' : ''}`}>
      <div className="relative flex-shrink-0 overflow-visible">
        <Checkbox
          checked={item.completed}
          onCheckedChange={handleToggleComplete}
          size="2"
        />
        {particles.map((p) => (
          <span
            key={p.id}
            className="confetti-particle"
            style={{
              '--confetti-x': `${p.x}px`,
              '--confetti-y': `${p.y}px`,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

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