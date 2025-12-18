import React, { useState } from 'react';
import { TextField, Button, Flex } from '@radix-ui/themes';
import { useShoppingList } from '../context/ShoppingListContext';

interface AddItemFormProps {
  listId: number;
}

export const AddItemForm = React.memo(({ listId }: AddItemFormProps) => {
  const { addItem } = useShoppingList();
  const [itemName, setItemName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      addItem(listId, itemName.trim());
      setItemName('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex gap="2">
        <TextField.Root
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Add an item..."
          size="3"
          style={{ flex: 1 }}
        />
        <Button
          type="submit"
          size="3"
          disabled={!itemName.trim()}
        >
          Add
        </Button>
      </Flex>
    </form>
  );
});

AddItemForm.displayName = 'AddItemForm';