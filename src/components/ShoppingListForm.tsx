import React, { useState } from 'react';
import { TextField, Button, Card, Flex, Heading, IconButton } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';

interface ShoppingListFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export const ShoppingListForm = React.memo(({ onSubmit, onCancel }: ShoppingListFormProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="3">
          <Flex align="center" justify="between">
            <Heading size="4">New Shopping List</Heading>
            <IconButton
              type="button"
              variant="ghost"
              color="gray"
              onClick={onCancel}
            >
              <Cross2Icon />
            </IconButton>
          </Flex>
          <TextField.Root
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter list name..."
            size="3"
            autoFocus
          />
          <Flex gap="2">
            <Button
              type="submit"
              style={{ flex: 1 }}
              disabled={!name.trim()}
            >
              Create List
            </Button>
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
});

ShoppingListForm.displayName = 'ShoppingListForm';
