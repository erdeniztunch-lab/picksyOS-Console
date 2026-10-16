import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ConsoleEngine } from './domain/engine';
import './styles/tokens.css';
import './styles/app.css';

const engine = new ConsoleEngine();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App engine={engine} />
  </StrictMode>,
);
