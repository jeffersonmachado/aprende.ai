import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/useAuth.js';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TechnicalDashboardPage from './pages/TechnicalDashboardPage.jsx';
import TracksPage from './pages/TracksPage.jsx';
import CompetenciesPage from './pages/CompetenciesPage.jsx';
import KnowledgePage from './pages/KnowledgePage.jsx';
import IntegrationPage from './pages/IntegrationPage.jsx';
import OnboardingPage from './features/onboarding/OnboardingPage.jsx';
import GoalSelectionPage from './features/goals/GoalSelectionPage.jsx';
import LearningStylePage from './features/learning-style/LearningStylePage.jsx';
import JourneyPage from './features/journey/JourneyPage.jsx';
import SimulationPage from './features/simulation/SimulationPage.jsx';
import FeedbackPage from './features/feedback/FeedbackPage.jsx';
import EvolutionPage from './features/evolution/EvolutionPage.jsx';
import OpenAISettingsPage from './features/settings/OpenAISettingsPage.jsx';
import JourneyFlowPage from './features/journey-flow/JourneyFlowPage.jsx';
import MentorPage from './features/mentor/MentorPage.jsx';
import AssessmentPage from './features/assessment/AssessmentPage.jsx';
import Layout from './components/Layout.jsx';
import { hasSystemAccess } from './utils/access.js';

function ProtectedRoute({ children }) {
	const { token } = useAuth();
	return token ? children : <Navigate to="/login" replace />;
}

function SystemRoute({ children }) {
	const { token, user } = useAuth();
	if (!token) return <Navigate to="/login" replace />;
	if (!user) return <div className="page-stack"><div>Carregando permissoes...</div></div>;
	return hasSystemAccess(user) ? children : <Navigate to="/journey-flow" replace />;
}

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route
				path="/"
				element={(
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				)}
			>
				<Route index element={<Navigate to="/journey-flow" replace />} />
				<Route path="dashboard" element={<DashboardPage />} />
				<Route
					path="system/dashboard"
					element={(
						<SystemRoute>
							<TechnicalDashboardPage />
						</SystemRoute>
					)}
				/>
				<Route path="tracks" element={<TracksPage />} />
				<Route path="competencies" element={<CompetenciesPage />} />
				<Route path="knowledge" element={<KnowledgePage />} />
				<Route
					path="integration"
					element={(
						<SystemRoute>
							<IntegrationPage />
						</SystemRoute>
					)}
				/>
				<Route path="onboarding" element={<OnboardingPage />} />
				<Route path="goals" element={<GoalSelectionPage />} />
				<Route path="learning-style" element={<LearningStylePage />} />
				<Route path="journey" element={<JourneyPage />} />
				<Route path="simulation" element={<SimulationPage />} />
				<Route path="simulation/:simulationRunId" element={<SimulationPage />} />
				<Route path="feedback" element={<Navigate to="/system/feedback" replace />} />
				<Route
					path="system/feedback"
					element={(
						<SystemRoute>
							<FeedbackPage />
						</SystemRoute>
					)}
				/>
				<Route path="evolution" element={<EvolutionPage />} />
				<Route
					path="settings/openai"
					element={(
						<SystemRoute>
							<OpenAISettingsPage />
						</SystemRoute>
					)}
				/>
				<Route path="journey-flow" element={<JourneyFlowPage />} />
				<Route path="journey-flow/:step" element={<JourneyFlowPage />} />
				<Route path="mentor" element={<MentorPage />} />
				<Route path="assessment" element={<AssessmentPage />} />
			</Route>
		</Routes>
	);
}
