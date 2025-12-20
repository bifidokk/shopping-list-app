import { useState, useEffect } from 'react';
import { Dialog, Button, TextField, Flex, Text } from '@radix-ui/themes';
import { Share2Icon, TrashIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useShoppingList } from '../context/ShoppingListContext';
import { ApiError } from '../api/client';
import type { ShoppingList } from '../types';

interface ShareListDialogProps {
  list: ShoppingList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Handle specific HTTP status codes
    switch (error.status) {
      case 409:
        return 'This user is already added to the list or the username doesn\'t exist.';
      case 404:
        return 'User not found. Please check the username and try again.';
      case 400:
        return 'Invalid username. Please enter a valid Telegram username.';
      case 403:
        return 'You don\'t have permission to share this list.';
      default:
        // If the error has a custom message from backend, use it
        if (error.message && !error.message.startsWith('HTTP')) {
          return error.message;
        }
        return 'Failed to share list. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function ShareListDialog({ list, open, onOpenChange }: ShareListDialogProps) {
  const { shareList, fetchListShares, removeShare } = useShoppingList();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && list.id) {
      // Fetch shares when dialog opens
      fetchListShares(list.id).catch((err) => {
        console.error('Failed to fetch shares:', err);
      });
      // Clear error when dialog opens
      setError(null);
    }
  }, [open, list.id, fetchListShares]);

  const handleShare = async () => {
    if (!telegramUsername.trim()) {
      setError('Please enter a Telegram username');
      return;
    }

    setIsSharing(true);
    setError(null);

    try {
      await shareList(list.id, telegramUsername.trim());
      setTelegramUsername('');
      // Show success feedback
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (err) {
      setError(getErrorMessage(err));
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemoveShare = async (userId: number) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showPopup({
        title: 'Remove Access',
        message: 'Are you sure you want to remove this person\'s access to the list?',
        buttons: [
          {
            id: 'remove',
            type: 'destructive',
            text: 'Remove',
          },
          {
            id: 'cancel',
            type: 'cancel',
            text: 'Cancel',
          },
        ],
      }, async (buttonId) => {
        if (buttonId === 'remove') {
          try {
            await removeShare(list.id, userId);
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          } catch (err) {
            console.error('Failed to remove share:', err);
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
          }
        }
      });
    } else {
      if (confirm('Are you sure you want to remove this person\'s access to the list?')) {
        try {
          await removeShare(list.id, userId);
        } catch (err) {
          console.error('Failed to remove share:', err);
        }
      }
    }
  };

  const shares = list.shares || [];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>
          <Flex align="center" gap="2">
            <Share2Icon />
            Share "{list.name}"
          </Flex>
        </Dialog.Title>

        <Dialog.Description size="2" mb="4">
          Share this shopping list with other Telegram users
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Telegram Username
            </Text>
            <Flex gap="2">
              <TextField.Root
                placeholder="@username"
                value={telegramUsername}
                onChange={(e) => {
                  setTelegramUsername(e.target.value);
                  // Clear error when user starts typing
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleShare();
                  }
                }}
                disabled={isSharing}
                style={{ flex: 1 }}
              />
              <Button onClick={handleShare} disabled={isSharing || !telegramUsername.trim()}>
                {isSharing ? 'Sharing...' : 'Share'}
              </Button>
            </Flex>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {shares.length > 0 && (
            <div className="mt-4">
              <Text as="div" size="2" mb="2" weight="bold">
                Shared with ({shares.length})
              </Text>
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {share.sharedWithUsername?.[0]?.toUpperCase() ||
                         share.sharedWithFirstName?.[0]?.toUpperCase() ||
                         '?'}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {share.sharedWithFirstName || share.sharedWithUsername || 'Unknown User'}
                          {share.sharedWithLastName && ` ${share.sharedWithLastName}`}
                        </div>
                        {share.sharedWithUsername && (
                          <div className="text-xs text-gray-500">
                            @{share.sharedWithUsername}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      color="red"
                      size="1"
                      onClick={() => handleRemoveShare(share.sharedWithUserId)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              <Cross2Icon />
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
