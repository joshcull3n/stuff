import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ContextProvider } from './Context'
import { TodoProvider } from './components/todo/todoContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ContextProvider>
      <TodoProvider>
        <App />
      </TodoProvider>
    </ContextProvider>
  </React.StrictMode>
);