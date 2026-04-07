import { Suspense, lazy, useEffect, useRef } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/useAuth.js';
import Layout from './components/Layout.jsx';
import { JourneyRuntimeProvider } from './context/JourneyRuntimeContext.jsx';

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const AprendeAiReferencePage = lazy(() => import('./pages/AprendeAiReferencePage.jsx'));
const AprendeAiGamePage = lazy(() => import('./pages/AprendeAiGamePage.jsx'));

const prefetchAprendeAiGamePage = () => import('./pages/AprendeAiGamePage.jsx');

function RouteFallback() {
	return <div className="page-stack"><div>Carregando tela...</div></div>;
}

function scheduleIdleWork(callback) {
	if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
		const id = window.requestIdleCallback(() => callback());
		return () => window.cancelIdleCallback(id);
	}

	const timeoutId = window.setTimeout(() => callback(), 150);
	return () => window.clearTimeout(timeoutId);
}

function ProtectedRoute({ children }) {
	const { token } = useAuth();
	return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
	const { token } = useAuth();
	const prefetchedGameRef = useRef(false);

	useEffect(() => {
		if (!token || prefetchedGameRef.current) return undefined;

		const cancel = scheduleIdleWork(() => {
			prefetchAprendeAiGamePage();
			prefetchedGameRef.current = true;
		});

		return cancel;
	}, [token]);

	return (
		<Suspense fallback={<RouteFallback />}>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/aprende-ai-reference" element={<AprendeAiReferencePage />} />
				<Route
					path="/"
					element={(
						<ProtectedRoute>
							<JourneyRuntimeProvider>
								<Layout />
							</JourneyRuntimeProvider>
						</ProtectedRoute>
					)}
				>
						<Route index element={<Navigate to="/aprende-ai-game" replace />} />
					<Route path="aprende-ai-game" element={<AprendeAiGamePage />} />
						<Route path="*" element={<Navigate to="/aprende-ai-game" replace />} />
				</Route>
			</Routes>
		</Suspense>
	);
}
