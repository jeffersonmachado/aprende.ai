import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Target } from 'lucide-react';
import AprendeAiGameFlow from '../components/reference/AprendeAiGameFlow.jsx';
import { useJourneyRuntime } from '../context/JourneyRuntimeContext.jsx';
import { getAdaptiveJourneyRuntime } from '../services/journeyAdaptiveApi.js';
import { getJourneySummary } from '../services/journeyApi.js';
import { startJourneyEnginePhase, submitJourneyEngineDecision } from '../services/journeyEngineApi.js';
import { postJourneyTelemetryEvent } from '../services/journeyTelemetryApi.js';
import { saveOnboarding } from '../services/profileApi.js';
import { getEvolution } from '../services/simulationApi.js';

const ONBOARDING_PROFILE_PAYLOADS = {
	Profissional: {
		profileKey: 'profissional',
		contextType: 'B2B',
		area: 'Operacoes',
		experienceLevel: 'intermediario',
		primaryObjective: 'Executar com consistencia em contexto de alta pressao.',
		goalTitle: 'Tomar decisoes sob pressao com clareza',
		goalType: 'melhorar performance',
		goalDescription: 'Quero responder mais rapido sem comprometer qualidade da escolha.',
		dominantStyle: 'pratico',
	},
	Estudante: {
		profileKey: 'estudante',
		contextType: 'B2C',
		area: 'Produto',
		experienceLevel: 'iniciante',
		primaryObjective: 'Explorar cenarios novos e reduzir incerteza com criterio.',
		goalTitle: 'Estruturar resposta para cenarios criticos',
		goalType: 'resolver problema',
		goalDescription: 'Quero organizar decisao por risco, impacto e sequencia de acao.',
		dominantStyle: 'explorador',
	},
	Empreendedor: {
		profileKey: 'empreendedor',
		contextType: 'B2C',
		area: 'Dados',
		experienceLevel: 'avancado',
		primaryObjective: 'Elevar qualidade de decisao com evidencias e analise de risco.',
		goalTitle: 'Estruturar resposta para cenarios criticos',
		goalType: 'resolver problema',
		goalDescription: 'Quero organizar decisao por risco, impacto e sequencia de acao.',
		dominantStyle: 'analitico',
	},
	'Autônomo': {
		profileKey: 'profissional',
		contextType: 'B2B',
		area: 'Operacoes',
		experienceLevel: 'intermediario',
		primaryObjective: 'Atuar com autonomia e consistencia em cenarios de pressao.',
		goalTitle: 'Tomar decisoes sob pressao com clareza',
		goalType: 'melhorar performance',
		goalDescription: 'Quero responder mais rapido sem comprometer qualidade da escolha.',
		dominantStyle: 'pratico',
	},
};

function resolveProfileLabel(persona = '') {
	const normalized = String(persona || '').toLowerCase();
	if (normalized.includes('prof')) return 'Profissional';
	if (normalized.includes('estu')) return 'Estudante';
	if (normalized.includes('empre')) return 'Empreendedor';
	if (normalized.includes('auto')) return 'Autônomo';
	return 'Profissional';
}

function formatLabel(value, fallback) {
	if (!value) return fallback;
	return String(value)
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, (match) => match.toUpperCase());
}

function mapPhaseToScene(phaseType) {
	if (!phaseType) return 0;
	if (phaseType === 'briefing') return 1;
	if (phaseType === 'mission-play' || phaseType === 'consequence' || phaseType === 'assessment') return 2;
	if (phaseType === 'plot-twist') return 3;
	if (phaseType === 'reflection') return 4;
	if (phaseType === 'phase-result' || phaseType === 'progression') return 5;
	return 0;
}

function buildCompetencyBars(evolution) {
	const items = (evolution?.competencies || []).slice(0, 4).map((item) => ({
		label: formatLabel(item?.competencyId || item?.name, 'Competência'),
		value: Math.round(Number(item?.score || item?.metrics?.mastery || 0)),
	})).filter((item) => item.value > 0);

	if (items.length) return items;

	return [
		{ label: 'Tomada de Decisão', value: 85 },
		{ label: 'Análise Crítica', value: 72 },
		{ label: 'Comunicação', value: 65 },
		{ label: 'Estratégia', value: 58 },
	];
}

async function ensureTelemetryFeedback(eventPayload) {
	const result = await postJourneyTelemetryEvent(eventPayload);
	if (!result?.ok) {
		throw new Error(result?.error || 'Falha ao sincronizar telemetria da jornada.');
	}
	return result;
}

export default function AprendeAiGamePage() {
	const {
		runtime,
		loading: runtimeLoading,
		error: runtimeError,
		firePlotTwist,
		resolveActivePlotTwist,
	} = useJourneyRuntime();
	const [journeySummary, setJourneySummary] = useState(null);
	const [evolution, setEvolution] = useState(null);
	const [adaptiveRuntime, setAdaptiveRuntime] = useState(null);
	const [pageError, setPageError] = useState('');
	const [pageLoading, setPageLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		Promise.allSettled([getJourneySummary(), getEvolution(), getAdaptiveJourneyRuntime()])
			.then(([journeyResult, evolutionResult, adaptiveResult]) => {
				if (cancelled) return;

				if (journeyResult.status === 'fulfilled') {
					setJourneySummary(journeyResult.value);
				}

				if (evolutionResult.status === 'fulfilled') {
					setEvolution(evolutionResult.value);
				}

				if (adaptiveResult.status === 'fulfilled') {
					setAdaptiveRuntime(adaptiveResult.value);
				}

				const errors = [journeyResult, evolutionResult, adaptiveResult]
					.filter((result) => result.status === 'rejected')
					.map((result) => result.reason?.message)
					.filter(Boolean);

				setPageError(errors[0] || '');
			})
			.finally(() => {
				if (!cancelled) {
					setPageLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const campaignProgress = runtime?.journey?.campaignProgress || null;
	const chapters = runtime?.campaign?.chapters || [];
	const activeChapter = useMemo(() => {
		return chapters.find((chapter) => chapter.id === campaignProgress?.chapterId) || chapters[0] || null;
	}, [campaignProgress?.chapterId, chapters]);
	const activePhase = useMemo(() => {
		return activeChapter?.phases?.find((phase) => phase.id === campaignProgress?.phaseId) || activeChapter?.phases?.[0] || null;
	}, [activeChapter, campaignProgress?.phaseId]);
	const activeCampaignRoute = activeChapter && activePhase ? `/campaign/${activeChapter.id}/${activePhase.id}` : '/campaign';
	const progressPercent = Math.round(Number(runtime?.journey?.progressPercent || evolution?.progression?.progressPercent || 0));
	const profileLabel = resolveProfileLabel(journeySummary?.adaptive?.persona);
	const competencyBars = buildCompetencyBars(evolution);
	const missionChoices = activePhase?.content?.mission?.choices || [];
	const adaptiveProgress = adaptiveRuntime?.progress || null;
	const adaptiveCompetencyName = adaptiveProgress?.competency?.name || 'competência prioritária';
	const chapterCounter = adaptiveProgress
		? `${Number(adaptiveProgress.completedChapters || 0)}/${Number(adaptiveProgress.estimatedChapterCount || 0)} capítulos`
		: `${Number(campaignProgress?.unlockedChapterIds?.length || 0)}/${Math.max(chapters.length, 1)} capítulos`;
	const resultStats = [
		{ label: 'Avanço', value: `${progressPercent}%` },
		{ label: 'Itens Comuns', value: `${Math.max(1, Math.min(9, Number(evolution?.decisionHistory?.length || 3)))}` },
		{ label: 'Badges', value: `${Math.max(1, Math.min(6, Number(journeySummary?.adaptive?.scenarios?.length || evolution?.decisionHistory?.length || 1)))}/6`, icon: true },
	];
	const hasActiveTwist = Boolean(runtime?.journey?.activePlotTwist?.id);

	const moduleLinks = useMemo(() => ({
		onboarding: { label: 'Avançar' },
		mapa: { label: 'Entrar no capítulo' },
		missao: { label: 'Executar decisão' },
		plot: { label: hasActiveTwist || activePhase?.type === 'plot-twist' ? 'Responder ruptura' : 'Aceitar evento' },
		dashboard: { label: 'Recolher progresso' },
		resultado: { label: adaptiveRuntime?.journeyId ? 'Jogar novo ciclo' : 'Reiniciar jornada' },
	}), [activeCampaignRoute, activePhase?.type, adaptiveRuntime?.journeyId, hasActiveTwist]);

	const sceneContent = useMemo(() => ({
		onboarding: {
			helperLabel: 'Objetivo da jornada',
			helperTitle: journeySummary?.adaptive?.goal || runtime?.mission?.title || 'Prepare sua campanha em 3 etapas',
			helperBody: runtime?.mission?.objective || journeySummary?.adaptive?.nextRecommendation || 'Defina perfil, meta e estilo antes de entrar no fluxo pedagógico real.',
			ctaLabel: 'Avançar',
		},
		mapa: {
			title: 'Sua Jornada',
			chapterLabel: 'Capítulo em foco',
			chapterTitle: activeChapter?.title || 'Campanha ativa',
			phaseTitle: activePhase?.title ? `${activePhase.title} · ${activePhase.description || 'fase sincronizada com o runtime'}` : 'Fase atual sincronizada com o runtime',
			progressLabel: `Progresso real da campanha: ${progressPercent}%`,
			ctaLabel: 'Entrar no capítulo',
		},
		missao: {
			mentorName: 'Alaine Sommer',
			mentorRole: runtime?.mission?.context || 'Nossa pensadora do que ninguém fez...',
			prompt: 'Qual é o impacto dessa escolha?',
			question: activePhase?.title || runtime?.mission?.title || 'Qual decisão move a campanha agora?',
			options: missionChoices.length
				? missionChoices.map((choice, index) => ({
					choiceId: choice?.id || null,
					label: choice?.label || `Escolha ${index + 1}`,
					icon: index === 0 ? Target : Sparkles,
					gradient: index === 0
						? 'linear-gradient(90deg, rgba(236,72,153,0.85) 0%, rgba(249,115,22,0.8) 100%)'
						: 'linear-gradient(90deg, rgba(249,115,22,0.85) 0%, rgba(234,179,8,0.75) 100%)',
				}))
				: [
					{ label: `Abrir ${formatLabel(activePhase?.title, 'fase atual')}`, icon: Target, gradient: 'linear-gradient(90deg, rgba(236,72,153,0.85) 0%, rgba(249,115,22,0.8) 100%)' },
					{ label: 'Revisar contexto da fase antes da execução', icon: Sparkles, gradient: 'linear-gradient(90deg, rgba(249,115,22,0.85) 0%, rgba(234,179,8,0.75) 100%)' },
				],
			ctaLabel: 'Executar decisão',
		},
		plot: {
			title: runtime?.journey?.activePlotTwist ? 'RUPTURA ATIVA!' : 'ALERTA!',
			subtitle: runtime?.journey?.activePlotTwist?.title || runtime?.mission?.context || 'Uma ruptura de contexto pode exigir resposta imediata na campanha real.',
			options: [
				{ letter: 'A', text: 'Ir para a campanha e responder a fase crítica atual.', gradient: 'linear-gradient(90deg, rgba(220,40,80,0.85), rgba(180,40,120,0.8))' },
				{ letter: 'B', text: 'Abrir simulações para ensaiar a decisão antes de agir.', gradient: 'linear-gradient(90deg, rgba(200,50,100,0.8), rgba(160,40,120,0.75))' },
				{ letter: 'C', text: 'Revisar sinais no dashboard e realinhar a estratégia.', gradient: 'linear-gradient(90deg, rgba(240,100,30,0.85), rgba(200,70,20,0.8))' },
			],
			ctaLabel: runtime?.journey?.activePlotTwist ? 'Responder ruptura' : 'Aceitar evento',
		},
		dashboard: {
			title: 'Seu Progresso',
			competencyBars,
			levelLabel: `Nível ${Number(runtime?.journey?.level || 1)}`,
			statusLabel: progressPercent >= 70 ? 'PRONTO PARA ESCALAR' : 'EVOLUINDO',
			ctaLabel: 'Recolher progresso',
		},
		resultado: {
			title: 'Parabéns!',
			subtitle: 'Treinamento Concluído',
			stats: resultStats,
			nextStepLabel: adaptiveProgress?.canClose ? 'Encerrar jornada adaptativa oficial' : `Desenvolva ${adaptiveCompetencyName}`,
			ctaLabel: adaptiveRuntime?.journeyId ? 'Jogar novo ciclo' : 'Reiniciar jornada',
		},
	}), [activeChapter?.title, activePhase?.description, activePhase?.title, adaptiveCompetencyName, adaptiveProgress?.canClose, adaptiveRuntime?.currentChapter?.title, competencyBars, journeySummary?.adaptive?.goal, missionChoices, progressPercent, resultStats, runtime?.journey?.activePlotTwist, runtime?.journey?.level, runtime?.mission?.context, runtime?.mission?.objective, runtime?.mission?.title]);

	const actionHandlers = useMemo(() => ({
		onboarding: async ({ selectedProfile }) => {
			const profilePayload = ONBOARDING_PROFILE_PAYLOADS[selectedProfile] || ONBOARDING_PROFILE_PAYLOADS.Profissional;
			await saveOnboarding({
				displayName: journeySummary?.adaptive?.persona || 'Aprendiz estrategista',
				...profilePayload,
			});
			await ensureTelemetryFeedback({
				eventType: 'gamified_onboarding_selected',
				stepId: 'gamified-onboarding',
				metadata: { selectedProfile },
			});
		},
		mapa: async () => {
			await ensureTelemetryFeedback({
				eventType: 'gamified_map_opened',
				stepId: activePhase?.id || 'campaign-map',
				metadata: {
					chapterId: activeChapter?.id,
					phaseId: activePhase?.id,
					progressPercent,
				},
			});
		},
		missao: async ({ option }) => {
			await ensureTelemetryFeedback({
				eventType: 'gamified_mission_selected',
				stepId: activePhase?.id || 'gamified-mission',
				metadata: {
					chapterId: activeChapter?.id,
					phaseId: activePhase?.id,
					optionLabel: option?.label,
				},
			});

			if (activePhase?.id && (activePhase?.type === 'mission-play' || activePhase?.type === 'consequence' || activePhase?.type === 'assessment')) {
				await startJourneyEnginePhase(activePhase.id, {
					chapterId: activeChapter?.id,
					missionId: activePhase?.content?.mission?.id || null,
				}).catch(() => null);

				const choiceId = option?.choiceId || activePhase?.content?.mission?.choices?.[0]?.id || null;
				if (choiceId) {
					await submitJourneyEngineDecision({
						chapterId: activeChapter?.id,
						choiceId,
						responseText: option?.label || 'Decisao iniciada pela experiencia gamificada.',
					});
				}
			}
		},
		plot: async ({ option }) => {
			await ensureTelemetryFeedback({
				eventType: 'gamified_plot_selected',
				stepId: activePhase?.id || 'gamified-plot',
				metadata: {
					optionLabel: option?.text,
					activeTwistId: runtime?.journey?.activePlotTwist?.id || null,
				},
			});

			if (runtime?.journey?.activePlotTwist?.id) {
				await resolveActivePlotTwist({
					twistLogId: runtime.journey.activePlotTwist.id,
					resolutionNotes: `Resolvido pela experiencia gamificada: ${option?.text || 'acao executada'}`,
				});
				return;
			}

			await firePlotTwist({ source: 'aprende-ai-game', reason: option?.text || 'Acao iniciada pela experiencia gamificada.' }).catch(() => null);
		},
		dashboard: async () => {
			await ensureTelemetryFeedback({
				eventType: 'gamified_dashboard_opened',
				stepId: 'gamified-dashboard',
				metadata: {
					progressPercent,
					competencies: competencyBars.map((item) => item.label),
				},
			});
		},
		resultado: async () => {
			await ensureTelemetryFeedback({
				eventType: 'gamified_result_opened',
				stepId: 'gamified-result',
				metadata: {
					adaptiveJourneyId: adaptiveRuntime?.journeyId || null,
					canClose: adaptiveProgress?.canClose || false,
				},
			});
		},
	}), [activeChapter?.id, activePhase?.content?.mission?.choices, activePhase?.content?.mission?.id, activePhase?.id, activePhase?.type, adaptiveProgress?.canClose, adaptiveRuntime?.journeyId, competencyBars, firePlotTwist, journeySummary?.adaptive?.persona, progressPercent, resolveActivePlotTwist, runtime?.journey?.activePlotTwist?.id]);

	return (
		<AprendeAiGameFlow
			initialScene={mapPhaseToScene(activePhase?.type)}
			initialProfile={profileLabel}
			sceneContent={sceneContent}
			moduleLinks={moduleLinks}
			actionHandlers={actionHandlers}
			experienceMode="runtime"
			status={{ loading: runtimeLoading || pageLoading, error: runtimeError || pageError }}
		/>
	);
}
