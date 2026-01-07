import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css'; // 공통 CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Toaster position="top-center" />
    <App />
  </BrowserRouter>
);
