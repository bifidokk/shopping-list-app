import { useEffect, lazy, Suspense } from 'react';
import { ShoppingListProvider, useShoppingList } from './context/ShoppingListContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { initTelegramWebApp } from './utils/telegram';

const ShoppingListGrid = lazy(() => import('./components/ShoppingListGrid').then(m => ({ default: m.ShoppingListGrid })));
const ShoppingListView = lazy(() => import('./components/ShoppingListView').then(m => ({ default: m.ShoppingListView })));

function AppContent() {
  const { state } = useShoppingList();

  useEffect(() => {
    initTelegramWebApp();
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }>
        {state.activeListId ? <ShoppingListView /> : <ShoppingListGrid />}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ShoppingListProvider>
        <AppContent />
      </ShoppingListProvider>
    </ErrorBoundary>
  );
}

