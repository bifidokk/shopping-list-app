import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShoppingListProvider } from './context/ShoppingListContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { initTelegramWebApp } from './utils/telegram';

const ShoppingListGrid = lazy(() => import('./components/ShoppingListGrid').then(m => ({ default: m.ShoppingListGrid })));
const ShoppingListView = lazy(() => import('./components/ShoppingListView').then(m => ({ default: m.ShoppingListView })));

function AppContent() {
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
        <Routes>
          <Route path="/" element={<ShoppingListGrid />} />
          <Route path="/list/:id" element={<ShoppingListView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ShoppingListProvider>
          <AppContent />
        </ShoppingListProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

