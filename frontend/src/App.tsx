import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OrderPage from './pages/OrderPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<OrderPage />} />
      <Route path="/app/*" element={<OrderPage />} />
    </Routes>
  );
}

export default App;
