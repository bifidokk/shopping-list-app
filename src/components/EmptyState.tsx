import React from 'react';

interface EmptyStateProps {
  onCreateFirst: () => void;
}

export const EmptyState = React.memo(({ onCreateFirst }: EmptyStateProps) => {
  return (
    <div className="text-center py-12 text-gray-500">
      <div className="mb-4">
        <svg className="w-16 h-16 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      </div>
      <p className="text-lg font-medium mb-2">No shopping lists yet</p>
      <button
        onClick={onCreateFirst}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        Create your first list
      </button>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
