import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TracksPage from './pages/TracksPage.jsx';
import CompetenciesPage from './pages/CompetenciesPage.jsx';
import KnowledgePage from './pages/KnowledgePage.jsx';
import IntegrationPage from './pages/IntegrationPage.jsx';
import Layout from './components/Layout.jsx';
function ProtectedRoute({ children }) { const { token } = useAuth(); return token ? children : <Navigate to="/login" replace />; }
export default function App() { return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}><Route index element={<DashboardPage />} /><Route path="tracks" element={<TracksPage />} /><Route path="competencies" element={<CompetenciesPage />} /><Route path="knowledge" element={<KnowledgePage />} /><Route path="integration" element={<IntegrationPage />} /></Route></Routes>; }
