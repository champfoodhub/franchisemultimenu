import { Outlet } from 'react-router-dom';
import './style.css';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <div>
        <Outlet />
      </div>
    </ToastProvider>
  );
}

export default App;
