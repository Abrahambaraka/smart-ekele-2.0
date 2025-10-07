import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Routes from './Routes';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/tailwind.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;