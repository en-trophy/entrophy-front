import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import ItemListPage from './pages/ItemListPage';
import LessonDetailPage from './pages/LessonDetailPage';
import PracticePage from './pages/PracticePage';
import ResultPage from './pages/ResultPage';
import SimulationPage from './pages/SimulationPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/category/:categoryId" element={<CategoryDetailPage />} />
        <Route path="/category/:categoryId/:level" element={<ItemListPage />} />
        <Route path="/lesson/:lessonId" element={<LessonDetailPage />} />
        <Route path="/practice/:lessonId" element={<PracticePage />} />
        <Route path="/result/:lessonId" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
