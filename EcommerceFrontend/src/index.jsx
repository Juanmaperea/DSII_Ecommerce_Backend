// index.jsx (general del proyecto)

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider } from './contexts/ConfigContext';
import { CategoryProvider } from './contexts/CategoryContext'; // Importar el CategoryProvider

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ConfigProvider>
    <CategoryProvider>
      <App />
    </CategoryProvider>
  </ConfigProvider>
);

reportWebVitals();
