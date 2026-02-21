import React, { useState, useRef } from 'react';
import { Checkbox, TextField, Button, Flex, Text, IconButton } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import confetti from 'canvas-confetti';
import { useShoppingList } from '../context/ShoppingListContext';
import type { ShoppingItem } from '../types';
import { useTelegramHaptics } from '../utils/telegram';

const DUST_COLORS = ['#d1d5db', '#9ca3af', '#6b7280', '#e5e7eb'];

function generateDustParticles(width: number, height: number) {
  return Array.from({ length: 50 }, (_, i) => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return {
      id: i,
      x,
      y,
      dx: 40 + Math.random() * 100,
      dy: (Math.random() - 0.5) * 80,
      size: 2 + Math.random() * 4,
      delay: (x / width) * 0.4,
      duration: 0.4 + Math.random() * 0.4,
      rotation: Math.random() * 90 - 45,
      color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
    };
  });
}

type DustParticle = ReturnType<typeof generateDustParticles>[number];

interface ShoppingItemComponentProps {
  item: ShoppingItem;
  listId: number;
}

export const ShoppingItemComponent = React.memo(({ item, listId }: ShoppingItemComponentProps) => {
  const { updateItem, deleteItem, toggleItem } = useShoppingList();
  const { impact, notification } = useTelegramHaptics();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [isDisintegrating, setIsDisintegrating] = useState(false);
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLDivElement>(null);

  const handleToggleComplete = () => {
    if (!item.completed) {
      // Fire confetti from the checkbox position
      const el = checkboxRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 30,
          spread: 60,
          startVelocity: 20,
          origin: { x, y },
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
          ticks: 60,
          scalar: 0.7,
          gravity: 0.8,
          disableForReducedMotion: true,
        });
      }
      notification('success');
      impact('light');
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
    const el = rowRef.current;
    if (!el) {
      deleteItem(listId, item.id);
      impact('medium');
      return;
    }

    const width = el.offsetWidth;
    const height = el.offsetHeight;
    setDustParticles(generateDustParticles(width, height));
    setIsDisintegrating(true);
    impact('medium');

    setTimeout(() => {
      deleteItem(listId, item.id);
    }, 900);
  };

  return (
    <div ref={rowRef} className={`relative overflow-visible ${isDisintegrating ? 'disintegrating' : ''}`}>
      {dustParticles.map((p) => (
        <span
          key={p.id}
          className="dust-particle"
          style={{
            '--dust-dx': `${p.dx}px`,
            '--dust-dy': `${p.dy}px`,
            '--dust-duration': `${p.duration}s`,
            '--dust-delay': `${p.delay}s`,
            '--dust-rotation': `${p.rotation}deg`,
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          } as React.CSSProperties}
        />
      ))}
    <Flex align="center" gap="3" className={`p-3 bg-gray-50 rounded-lg overflow-visible ${item.completed ? 'opacity-60' : ''}`}>
      <div ref={checkboxRef} className="flex-shrink-0">
        <Checkbox
          checked={item.completed}
          onCheckedChange={handleToggleComplete}
          size="2"
        />
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
    </div>
  );
});

ShoppingItemComponent.displayName = 'ShoppingItemComponent';
