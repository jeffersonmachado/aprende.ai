import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowLeft,
	ArrowRight,
	BriefcaseBusiness,
	CircleAlert,
	Crown,
	Flame,
	GraduationCap,
	Lock,
	MessageSquareText,
	Rocket,
	ShieldQuestion,
	Sparkles,
	Target,
	TrendingUp,
	UserRound,
	Zap,
} from 'lucide-react';
import { useState } from 'react';

const defaultAssetManifest = {
	profiles: {
		Profissional: '/aprende-ai-game/profiles/profissional.webp',
		Estudante: '/aprende-ai-game/profiles/estudante.webp',
		Líder: '/aprende-ai-game/profiles/lider.webp',
		Empreendedor: '/aprende-ai-game/profiles/empreendedor.webp',
	},
	mentor: '/aprende-ai-game/mentor/alirto-sovner.webp',
	boss: '/aprende-ai-game/boss/boss-final.webp',
};

const profileCards = [
	{
		label: 'Profissional',
		icon: BriefcaseBusiness,
		palette: {
			from: '#6ca8ff',
			via: '#d76ad8',
			to: '#2e2148',
			head: '#f5d4c0',
			shadow: '#d39b87',
			hair: '#12192f',
			jacket: '#263d68',
			shirt: '#5cc6ff',
			accent: '#82d8ff',
		},
	},
	{
		label: 'Estudante',
		icon: GraduationCap,
		palette: {
			from: '#ff8ed7',
			via: '#ffa76e',
			to: '#35204e',
			head: '#f6d1c2',
			shadow: '#d8a292',
			hair: '#f6ecff',
			jacket: '#f4f2ff',
			shirt: '#ffd4f0',
			accent: '#ffd6ef',
		},
	},
	{
		label: 'Líder',
		icon: Crown,
		palette: {
			from: '#f2669f',
			via: '#ff7b7b',
			to: '#311f47',
			head: '#e6bc9b',
			shadow: '#ba8f74',
			hair: '#2f1c28',
			jacket: '#3a2a3b',
			shirt: '#58456b',
			accent: '#ffb6cf',
		},
	},
	{
		label: 'Empreendedor',
		icon: Rocket,
		palette: {
			from: '#ff9355',
			via: '#c08cff',
			to: '#281834',
			head: '#efc09f',
			shadow: '#c28b67',
			hair: '#332128',
			jacket: '#616f92',
			shirt: '#ffd28b',
			accent: '#ffd08f',
		},
	},
];

const journeySteps = [
	{ label: 'Início', icon: Zap, glow: '#56b8ff', border: '#4b6cff', active: true, offset: 'translate-y-0' },
	{ label: 'Análise', icon: UserRound, glow: '#9e90ff', border: '#8674ff', offset: 'translate-y-2' },
	{ label: 'Decisão', icon: ShieldQuestion, glow: '#de85ff', border: '#cf67ff', offset: '-translate-y-1' },
	{ label: 'Reviravolta', icon: CircleAlert, glow: '#ff5cb8', border: '#ff4f94', offset: 'translate-y-3' },
	{ label: 'Estratégia', icon: MessageSquareText, glow: '#ff7fbb', border: '#ff6e97', offset: 'translate-y-0' },
];

const competencyBars = [
	{ label: 'Tomada de Decisão', value: 72 },
	{ label: 'Análise Crítica', value: 65 },
	{ label: 'Comunicação', value: 58 },
	{ label: 'Estratégia', value: 81 },
];

const radarAxes = [
	{ angle: -90, value: 0.82 },
	{ angle: -30, value: 0.58 },
	{ angle: 30, value: 0.72 },
	{ angle: 90, value: 0.65 },
	{ angle: 150, value: 0.61 },
	{ angle: 210, value: 0.74 },
];

const stars = [
	{ left: '6%', top: '16%', size: 4, opacity: 0.35 },
	{ left: '14%', top: '47%', size: 3, opacity: 0.52 },
	{ left: '20%', top: '30%', size: 2, opacity: 0.46 },
	{ left: '23%', top: '72%', size: 3, opacity: 0.38 },
	{ left: '29%', top: '53%', size: 2, opacity: 0.42 },
	{ left: '37%', top: '41%', size: 3, opacity: 0.5 },
	{ left: '45%', top: '24%', size: 2, opacity: 0.4 },
	{ left: '51%', top: '61%', size: 4, opacity: 0.45 },
	{ left: '58%', top: '17%', size: 3, opacity: 0.36 },
	{ left: '61%', top: '43%', size: 2, opacity: 0.42 },
	{ left: '68%', top: '68%', size: 2, opacity: 0.3 },
	{ left: '73%', top: '27%', size: 3, opacity: 0.5 },
	{ left: '77%', top: '49%', size: 4, opacity: 0.33 },
	{ left: '83%', top: '36%', size: 2, opacity: 0.48 },
	{ left: '89%', top: '21%', size: 3, opacity: 0.55 },
	{ left: '91%', top: '59%', size: 2, opacity: 0.4 },
	{ left: '95%', top: '12%', size: 4, opacity: 0.25 },
];

const scenes = [
	{ id: 'onboarding', step: '1. Onboarding', title: 'Escolha seu Perfil', subtitle: '1 de 3' },
	{ id: 'mapa', step: '2. Mapa da Jornada', title: 'Sua Jornada', subtitle: 'Rota ativa' },
	{ id: 'missao', step: '3. Missão', title: 'Escolha crítica', subtitle: 'Narrativa guiada' },
	{ id: 'plot', step: '4. Plot Twist', title: 'Evento inesperado', subtitle: 'Resposta rápida' },
	{ id: 'dashboard', step: '5. Dashboard de Competências', title: 'Seu Progresso', subtitle: 'Leitura viva de performance' },
	{ id: 'resultado', step: '6. Resultado Final', title: 'Treinamento Concluído', subtitle: 'Fechamento da sessão' },
];

const shellCardStyle = {
	background: 'linear-gradient(180deg, rgba(34, 14, 62, 0.86) 0%, rgba(20, 10, 41, 0.92) 100%)',
	border: '1px solid rgba(215, 110, 255, 0.42)',
	boxShadow: '0 24px 60px rgba(9, 4, 26, 0.58), 0 0 0 1px rgba(255, 114, 226, 0.08) inset, 0 0 36px rgba(225, 73, 173, 0.24)',
	backdropFilter: 'blur(16px)',
	WebkitBackdropFilter: 'blur(16px)',
};

const innerCardStyle = {
	background: 'linear-gradient(180deg, rgba(34, 16, 60, 0.78), rgba(20, 11, 36, 0.88))',
	border: '1px solid rgba(226, 118, 255, 0.28)',
	boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.03) inset, 0 16px 34px rgba(5, 2, 18, 0.44)',
};

function polarToCartesian(angle, radius, center = 50) {
	const radians = (angle * Math.PI) / 180;
	return {
		x: center + Math.cos(radians) * radius,
		y: center + Math.sin(radians) * radius,
	};
}

function polygonPath(points) {
	return points.map(({ x, y }) => `${x},${y}`).join(' ');
}

function SparkField({ points, className = '' }) {
	return (
		<div className={`pointer-events-none absolute inset-0 ${className}`}>
			{points.map((point, index) => (
				<span
					key={`${point.left}-${point.top}-${index}`}
					className="absolute rounded-full blur-[1px]"
					style={{
						left: point.left,
						top: point.top,
						width: point.size ? `${point.size}px` : '8px',
						height: point.size ? `${point.size}px` : '8px',
						opacity: point.opacity ?? 0.8,
						background: point.hue || 'rgba(255,255,255,0.9)',
						boxShadow: `0 0 ${point.size ? point.size * 5 : 20}px ${point.hue || 'rgba(255,255,255,0.8)'}`,
					}}
				/>
			))}
		</div>
	);
}

function TextureVeil({ className = '' }) {
	return (
		<div
			className={`pointer-events-none absolute inset-0 ${className}`}
			style={{
				backgroundImage: [
					'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.07) 0, rgba(255,255,255,0.07) 1px, transparent 1px)',
					'radial-gradient(circle at 78% 34%, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px)',
					'linear-gradient(180deg, rgba(255,255,255,0.07), transparent 18%, transparent 84%, rgba(0,0,0,0.12))',
					'radial-gradient(circle at center, transparent 54%, rgba(0,0,0,0.14) 100%)',
				].join(','),
				backgroundSize: '22px 22px, 30px 30px, 100% 100%, 100% 100%',
				opacity: 0.7,
			}}
		/>
	);
}

function OptionalArt({ src, alt, className = '', imgClassName = '', fallback }) {
	const [hasError, setHasError] = useState(false);

	if (!src || hasError) {
		return fallback;
	}

	return (
		<div className={className}>
			<img
				src={src}
				alt={alt}
				className={imgClassName}
				onError={() => setHasError(true)}
			/>
		</div>
	);
}

function CharacterPortraitSvg({ palette, label, className = '' }) {
	const isStudent = label === 'Estudante';
	const isLeader = label === 'Líder';
	const isEntrepreneur = label === 'Empreendedor';

	return (
		<svg viewBox="0 0 120 140" className={className} aria-hidden="true">
			<defs>
				<linearGradient id={`bg-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor={palette.accent} stopOpacity="0.9" />
					<stop offset="100%" stopColor={palette.jacket} stopOpacity="0.95" />
				</linearGradient>
				<radialGradient id={`skin-${label}`} cx="40%" cy="35%" r="70%">
					<stop offset="0%" stopColor="#fff6ef" />
					<stop offset="70%" stopColor={palette.head} />
					<stop offset="100%" stopColor={palette.shadow} />
				</radialGradient>
				<linearGradient id={`shirt-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stopColor={palette.shirt} />
					<stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
				</linearGradient>
			</defs>
			<ellipse cx="60" cy="118" rx="33" ry="10" fill="rgba(0,0,0,0.22)" />
			<path d="M28 110 C34 82 86 82 92 110 L98 132 L22 132 Z" fill={`url(#bg-${label})`} />
			<path d="M43 88 C49 81 71 81 77 88 L73 113 L47 113 Z" fill={`url(#shirt-${label})`} opacity="0.95" />
			<path d="M45 64 C50 71 70 71 75 64 L78 88 L42 88 Z" fill={palette.head} opacity="0.9" />
			<ellipse cx="60" cy="50" rx="22" ry="24" fill={`url(#skin-${label})`} />
			<path d={isLeader ? 'M37 43 C38 18 82 16 84 44 L82 46 C76 38 71 35 60 35 C48 35 43 39 38 47 Z' : isStudent ? 'M36 46 C37 20 83 19 84 47 C77 40 73 38 60 38 C47 38 43 41 36 47 Z' : isEntrepreneur ? 'M35 44 C39 21 80 18 85 43 C78 37 72 34 60 34 C47 34 41 38 35 45 Z' : 'M37 45 C40 19 80 19 83 45 C76 39 72 36 60 36 C48 36 44 39 37 46 Z'} fill={palette.hair} />
			<circle cx="52" cy="51" r="2.1" fill="#43263d" />
			<circle cx="68" cy="51" r="2.1" fill="#43263d" />
			<path d="M54 63 C58 66 62 66 66 63" stroke="#99645f" strokeWidth="2.2" strokeLinecap="round" fill="none" />
			<path d="M59 50 L57 59 L63 59" stroke="#c68e7d" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75" />
			{isLeader ? <path d="M47 18 L53 8 L60 18 L67 8 L73 18" stroke="#ffe394" strokeWidth="2" strokeLinecap="round" fill="none" /> : null}
			{isStudent ? <circle cx="26" cy="90" r="10" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.24)" /> : null}
			{isEntrepreneur ? <rect x="84" y="84" width="20" height="10" rx="5" fill="rgba(255,199,123,0.22)" stroke="rgba(255,205,141,0.5)" /> : null}
		</svg>
	);
	}


function PortraitIllustration({ palette, label, assetSrc }) {
	return (
		<OptionalArt
			src={assetSrc}
			alt={label}
			className="absolute inset-x-0 top-[8px] flex justify-center sm:top-[10px]"
			imgClassName="h-[118px] w-[96px] rounded-[16px] object-cover object-top drop-shadow-[0_12px_18px_rgba(0,0,0,0.24)] sm:h-[136px] sm:w-[114px] sm:rounded-[18px]"
			fallback={
				<CharacterPortraitSvg palette={palette} label={label} className="absolute left-1/2 top-[10px] h-[116px] w-[98px] -translate-x-1/2 drop-shadow-[0_12px_18px_rgba(0,0,0,0.24)] sm:top-[12px] sm:h-[132px] sm:w-[112px]" />
			}
		/>
	);
}

function MentorAvatar({ assetSrc }) {
	const palette = {
		head: '#f6d0c4',
		shadow: '#c58f7d',
		hair: '#231824',
		jacket: '#1e2f5b',
		shirt: '#6f83c8',
		accent: '#d884d8',
	};

	return (
		<div className="relative h-16 w-16 rounded-full border border-pink-300/40 bg-[radial-gradient(circle_at_35%_30%,rgba(255,223,238,0.86),rgba(222,105,186,0.9)_58%,rgba(73,19,88,0.95))]">
			<OptionalArt
				src={assetSrc}
				alt="Alirto Sovner"
				className="absolute inset-[3px] overflow-hidden rounded-full"
				imgClassName="h-full w-full object-cover object-top"
				fallback={<CharacterPortraitSvg palette={palette} label="Mentor" className="absolute left-1/2 top-[2px] h-[68px] w-[68px] -translate-x-1/2" />}
			/>
		</div>
	);
}

function PortraitTile({ label, icon: Icon, palette, selected, onSelect, assetSrc }) {
	return (
		<motion.button
			type="button"
			onClick={onSelect}
			whileHover={{ y: -3, scale: 1.015 }}
			whileTap={{ scale: 0.99 }}
			className="group relative overflow-hidden rounded-[18px] border text-left"
			style={{
				borderColor: selected ? 'rgba(255, 195, 104, 0.8)' : 'rgba(232, 121, 249, 0.45)',
				background: `linear-gradient(135deg, ${palette.from}, ${palette.via} 45%, ${palette.to})`,
				boxShadow: selected
					? '0 0 0 2px rgba(255,180,82,0.28), 0 14px 32px rgba(0, 0, 0, 0.35), 0 0 26px rgba(255, 178, 82, 0.34)'
					: '0 14px 32px rgba(0, 0, 0, 0.35), 0 0 26px rgba(255, 84, 199, 0.18)',
			}}
		>
			<div className="relative h-[132px] overflow-hidden sm:h-[170px]">
				<TextureVeil className="opacity-55" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.34),transparent_28%),radial-gradient(circle_at_84%_28%,rgba(255,198,244,0.42),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_56%)]" />
				<div className="absolute left-3 top-3 rounded-full border border-white/35 bg-white/10 p-1.5 text-white/80 backdrop-blur-sm">
					<Icon size={14} />
				</div>
				<PortraitIllustration palette={palette} label={label} assetSrc={assetSrc} />
				<div className="absolute left-[10px] top-[82px] h-[34px] w-[22px] rounded-full bg-white/10 blur-md sm:left-[12px] sm:top-[96px] sm:h-[40px] sm:w-[26px]" />
				<div className="absolute right-[10px] top-[36px] h-[42px] w-[22px] rounded-full bg-fuchsia-200/10 blur-md sm:right-[12px] sm:top-[44px] sm:h-[54px] sm:w-[28px]" />
				<div className="absolute bottom-0 left-0 right-0 h-14 bg-[linear-gradient(180deg,transparent,rgba(24,8,34,0.82)_58%,rgba(17,7,28,0.96))]" />
			</div>
			<div className="relative flex items-center justify-between px-3 pb-3 pt-2">
				<span className="block text-[13px] font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,126,221,0.28)] sm:text-[17px]">
					{label}
				</span>
				{selected ? <span className="rounded-full bg-amber-300/20 px-2 py-1 text-[11px] font-black text-amber-100">ATIVO</span> : null}
			</div>
		</motion.button>
	);
}

function RadarChart() {
	const rings = [16, 25, 34, 43];
	const axisPoints = radarAxes.map((axis) => polarToCartesian(axis.angle, 38));
	const valuePoints = radarAxes.map((axis) => polarToCartesian(axis.angle, 38 * axis.value));

	return (
		<svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
			<defs>
				<linearGradient id="game-radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="rgba(87, 151, 255, 0.95)" />
					<stop offset="50%" stopColor="rgba(255, 92, 181, 0.96)" />
					<stop offset="100%" stopColor="rgba(255, 127, 65, 0.95)" />
				</linearGradient>
				<linearGradient id="game-radar-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="rgba(102, 179, 255, 0.92)" />
					<stop offset="100%" stopColor="rgba(255, 103, 214, 0.92)" />
				</linearGradient>
				<filter id="game-radar-glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="2.8" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
			{rings.map((radius) => (
				<polygon
					key={radius}
					points={polygonPath(radarAxes.map((axis) => polarToCartesian(axis.angle, radius)))}
					fill="none"
					stroke="rgba(215, 172, 255, 0.34)"
					strokeWidth="0.55"
				/>
			))}
			{axisPoints.map((point, index) => (
				<line
					key={index}
					x1="50"
					y1="50"
					x2={point.x}
					y2={point.y}
					stroke="rgba(206, 168, 255, 0.28)"
					strokeWidth="0.6"
				/>
			))}
			<polygon
				points={polygonPath(valuePoints)}
				fill="url(#game-radar-fill)"
				fillOpacity="0.75"
				stroke="url(#game-radar-stroke)"
				strokeWidth="1.25"
				filter="url(#game-radar-glow)"
			/>
			{valuePoints.map((point, index) => (
				<g key={index}>
					<circle cx={point.x} cy={point.y} r="1.8" fill="#ffd6f8" filter="url(#game-radar-glow)" />
					<circle cx={point.x} cy={point.y} r="0.85" fill="#fff" />
				</g>
			))}
			<circle cx="50" cy="50" r="5.5" fill="rgba(255, 98, 173, 0.84)" filter="url(#game-radar-glow)" />
		</svg>
	);
}

function GameShell({ scene, index, total, children, onNext, onPrev, disableNext = false, nextLabel = 'Avançar' }) {
	return (
		<div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col items-center justify-center px-3 py-5 sm:px-6 sm:py-8 lg:px-10">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[6%] top-[10%] h-44 w-44 rounded-full bg-fuchsia-500/12 blur-3xl" />
				<div className="absolute right-[8%] top-[18%] h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
				<div className="absolute bottom-[10%] left-[18%] h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
			</div>
			<div className="relative mb-4 flex max-w-[680px] flex-col items-center gap-2.5 text-center sm:mb-5 sm:gap-3">
				<div className="text-[20px] font-black tracking-[-0.04em] text-[#d8b2ff] drop-shadow-[0_0_18px_rgba(224,152,255,0.24)] sm:text-[28px] lg:text-[36px]">{scene.step}</div>
				<div className="flex gap-2">
					{scenes.map((item, dotIndex) => (
						<motion.span
							key={item.id}
							animate={{ scale: dotIndex === index ? 1.08 : 1, opacity: dotIndex === index ? 1 : 0.42 }}
							className="h-2 rounded-full"
							style={{
								width: dotIndex === index ? 26 : 8,
								background: dotIndex === index ? 'linear-gradient(90deg, #ff5cb8, #ff9839)' : 'rgba(255,255,255,0.18)',
								boxShadow: dotIndex === index ? '0 0 14px rgba(255,100,178,0.4)' : 'none',
							}}
						/>
					))}
				</div>
			</div>
			<div className="relative flex w-full items-center justify-center">{children}</div>
			<div className="relative mt-4 flex w-full max-w-[860px] flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
				<button
					type="button"
					onClick={onPrev}
					disabled={index === 0}
					className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/14 bg-white/6 px-5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-35 sm:order-1 sm:w-auto"
				>
					<ArrowLeft size={16} />
					Voltar
				</button>
				<div className="order-first rounded-full border border-white/12 bg-white/6 px-4 py-1.5 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/82 sm:order-2 sm:text-xs sm:tracking-[0.2em]">
					Cena {index + 1}/{total}
				</div>
				<button
					type="button"
					onClick={onNext}
					disabled={disableNext}
					className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-orange-300/55 px-6 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-45 sm:order-3 sm:w-auto"
					style={{
						background: 'linear-gradient(90deg, #ff4ea3 0%, #ff7a5f 55%, #f59e0b 100%)',
						boxShadow: '0 0 24px rgba(255, 113, 113, 0.25), inset 0 1px 1px rgba(255,255,255,0.24)',
					}}
				>
					{nextLabel}
					<ArrowRight size={16} />
				</button>
			</div>
		</div>
	);
}

function OnboardingScene({ selectedProfile, setSelectedProfile, assets }) {
	return (
		<div className="mx-auto flex h-full w-full max-w-[360px] flex-col justify-between overflow-hidden rounded-[24px] border border-fuchsia-400/28 bg-[linear-gradient(180deg,rgba(31,11,53,0.84),rgba(16,8,30,0.78))] p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_26px_rgba(217,70,239,0.18)] min-[400px]:max-w-[390px] sm:rounded-[28px] sm:p-5">
			<TextureVeil className="opacity-32" />
			<SparkField
				points={[
					{ left: '5%', top: '46%', hue: '#7c3aed' },
					{ left: '20%', top: '82%', hue: '#ef4444' },
					{ left: '61%', top: '16%', hue: '#ec4899' },
					{ left: '84%', top: '86%', hue: '#f97316' },
				]}
				className="opacity-80"
			/>
			<div className="mb-4 flex items-start justify-between gap-3 rounded-[18px] border border-fuchsia-300/20 bg-[linear-gradient(180deg,rgba(61,20,86,0.65),rgba(32,12,50,0.72))] px-3 py-3 sm:px-4 sm:py-3.5">
				<div className="flex min-w-0 items-center gap-3 sm:gap-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90">
						<ArrowLeft size={18} />
					</div>
					<div className="min-w-0 text-[22px] font-black leading-none tracking-[-0.04em] text-white sm:text-[30px]">Escolha seu Perfil</div>
				</div>
				<div className="whitespace-nowrap pt-1 text-[13px] font-bold text-white/90 sm:text-sm">1 de 3</div>
			</div>
			<div className="grid flex-1 grid-cols-2 gap-2.5 sm:gap-3">
				{profileCards.map((profile) => (
					<PortraitTile
						key={profile.label}
						{...profile}
						assetSrc={assets?.profiles?.[profile.label]}
						selected={selectedProfile === profile.label}
						onSelect={() => setSelectedProfile(profile.label)}
					/>
				))}
			</div>
			<div className="mt-5 flex justify-center">
				<button
					type="button"
					className="h-[42px] w-full rounded-full border border-orange-300/55 px-6 text-[17px] font-black text-white sm:min-w-[172px] sm:max-w-[198px] sm:text-[18px]"
					style={{
						background: 'linear-gradient(90deg, #ff4ea3 0%, #ff7a5f 55%, #f59e0b 100%)',
						boxShadow: '0 0 24px rgba(255, 113, 113, 0.25), inset 0 1px 1px rgba(255,255,255,0.24)',
					}}
				>
					Avançar
				</button>
			</div>
		</div>
	);
}

function JourneyScene({ bossAssetSrc }) {
	return (
		<div className="mx-auto relative h-full w-full max-w-[720px] overflow-hidden rounded-[24px] p-4 md:max-w-[860px] sm:rounded-[28px] sm:p-6" style={innerCardStyle}>
			<TextureVeil className="opacity-28" />
			<SparkField points={stars} className="opacity-90" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(105,81,255,0.1),transparent_28%),radial-gradient(circle_at_85%_34%,rgba(255,116,54,0.12),transparent_18%)]" />
			<div className="pointer-events-none absolute inset-x-[14%] top-[30%] h-[120px] rounded-full bg-[radial-gradient(circle,rgba(128,96,255,0.14),transparent_62%)] blur-3xl" />
			<div className="absolute inset-x-5 top-10 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(139,203,255,0.72),rgba(255,113,197,0.68),transparent)] md:block" />
			<div className="absolute right-5 top-5 flex gap-2">
				{[0, 1, 2, 3].map((index) => (
					<span key={index} className="h-1.5 w-1.5 rounded-full bg-white/40" />
				))}
			</div>
			<div className="mb-5 border-b border-white/12 pb-4 text-center text-[28px] font-black tracking-[-0.06em] text-white sm:mb-6 sm:text-[38px]">Sua Jornada</div>
			<div className="relative pt-6 md:pt-8">
				<div className="absolute left-[10%] right-[14%] top-[34px] hidden h-[7px] rounded-full bg-[linear-gradient(90deg,rgba(73,113,255,0.86)_0%,rgba(167,115,255,0.9)_34%,rgba(255,77,181,0.9)_70%,rgba(255,128,33,1)_100%)] shadow-[0_0_32px_rgba(255,94,178,0.7)] md:block md:left-[8%] md:right-[12%]" />
				<div className="absolute left-[7%] right-[9%] top-[24px] hidden h-[24px] rounded-full bg-[radial-gradient(circle,rgba(255,95,178,0.16),transparent_64%)] blur-xl md:block" />
				<div className="absolute left-[10%] right-[14%] top-[33px] hidden h-[2px] rounded-full bg-white/35 blur-[1px] md:block" />
				<div className="mb-5 flex justify-center md:hidden">
					<div className="rounded-full border border-fuchsia-300/24 bg-white/6 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white/72">
						Rota Ativa
					</div>
				</div>
				<div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-6 min-[520px]:grid-cols-3 md:grid-cols-6 md:gap-3">
					{journeySteps.map((step) => {
						const Icon = step.icon;
						return (
							<div key={step.label} className={`relative z-10 flex flex-col items-center gap-3 text-center ${step.offset}`}>
								<div className="absolute top-6 h-10 w-10 rounded-full bg-white/8 blur-xl" />
								<div
									className="flex h-[58px] w-[58px] items-center justify-center rounded-full border text-white"
									style={{
										background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.34), ${step.glow} 55%, rgba(25, 9, 46, 0.96))`,
										borderColor: step.border,
										boxShadow: step.active ? `0 0 0 3px rgba(120, 66, 255, 0.18), 0 0 24px ${step.glow}` : `0 0 18px ${step.glow}`,
									}}
								>
									<Icon size={20} />
								</div>
								<span className="text-[14px] font-bold text-white drop-shadow-[0_0_12px_rgba(0,0,0,0.45)]">{step.label}</span>
							</div>
						);
					})}
					<div className="relative z-10 col-span-2 flex flex-col items-center gap-3 text-center min-[520px]:col-span-3 md:col-span-6 lg:col-auto">
						<div className="absolute top-[-8px] h-28 w-28 rounded-full bg-orange-400/16 blur-2xl" />
						<div className="absolute top-[-2px] h-22 w-22 rounded-full border border-orange-200/16" />
						<motion.div
							animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 22px rgba(255,130,48,0.35)', '0 0 34px rgba(255,130,48,0.75)', '0 0 22px rgba(255,130,48,0.35)'] }}
							transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
							className="relative flex h-20 w-20 items-center justify-center rounded-[22px] border border-orange-300/80 text-white"
							style={{ background: 'radial-gradient(circle at 35% 25%, rgba(255,230,168,0.86), rgba(255,123,28,0.98) 52%, rgba(98,25,5,0.98) 100%)' }}
						>
							<div className="absolute inset-[-18px] rounded-[30px] bg-orange-400/14 blur-2xl" />
							<OptionalArt
								src={bossAssetSrc}
								alt="Boss Final"
								className="absolute inset-[6px] overflow-hidden rounded-[18px]"
								imgClassName="h-full w-full object-cover"
								fallback={<Flame size={34} />}
							/>
						</motion.div>
						<div className="rounded-[20px] border border-red-400/70 bg-[linear-gradient(90deg,rgba(93,20,20,0.86),rgba(148,22,22,0.88)_45%,rgba(255,95,36,0.9))] px-4 py-2 text-[14px] font-black tracking-[-0.02em] text-white shadow-[0_0_40px_rgba(255,76,31,0.58)] sm:px-5 sm:py-2.5 sm:text-[17px]">
							Boss Final?
						</div>
					</div>
				</div>
				<div className="relative mt-10 flex flex-wrap items-center justify-center gap-5 sm:mt-12 sm:gap-8">
					<div className="absolute left-[18%] right-[18%] top-5 hidden h-px bg-[linear-gradient(90deg,rgba(255,175,83,0.9),rgba(173,127,255,0.58))] md:block" />
					<div className="absolute left-[18%] right-[18%] top-[15px] hidden h-5 rounded-full bg-[radial-gradient(circle,rgba(255,178,95,0.18),transparent_62%)] blur-xl md:block" />
					{[0, 1, 2, 3].map((item) => (
						<div key={item} className="relative z-10 flex flex-col items-center gap-2">
							<div
								className="flex h-10 w-10 items-center justify-center rounded-full border"
								style={{
									background: item === 0
										? 'radial-gradient(circle at 35% 35%, rgba(255,238,173,0.72), rgba(247,126,34,0.92) 56%, rgba(97,35,6,0.98))'
										: 'linear-gradient(180deg, rgba(92,70,128,0.5), rgba(42,27,69,0.7))',
									borderColor: item === 0 ? 'rgba(255, 174, 74, 0.8)' : 'rgba(173, 127, 255, 0.28)',
									boxShadow: item === 0 ? '0 0 20px rgba(255, 155, 52, 0.55)' : 'none',
								}}
							>
								<Lock size={16} className="text-white" />
							</div>
							{item === 0 ? <span className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-100/72">Unlock</span> : null}
						</div>
					))}
				</div>
			</div>
			<div className="pointer-events-none absolute right-[5%] top-[20%] h-40 w-40 rounded-full bg-orange-500/26 blur-3xl" />
			<div className="pointer-events-none absolute right-[8%] top-[31%] h-28 w-28 rounded-full bg-red-500/28 blur-2xl" />
		</div>
	);
}

function MissionScene({ mentorAssetSrc }) {
	return (
		<div className="mx-auto relative w-full max-w-[360px] overflow-hidden rounded-[24px] p-4 min-[400px]:max-w-[390px] sm:rounded-[28px] sm:p-5" style={innerCardStyle}>
				<TextureVeil className="opacity-28" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_14%,rgba(255,82,134,0.18),transparent_18%),radial-gradient(circle_at_14%_86%,rgba(255,132,53,0.14),transparent_20%)]" />
				<div className="absolute inset-x-5 top-0 h-[3px] rounded-full bg-[linear-gradient(90deg,transparent,#ff3e88_40%,#ff6c57_70%,transparent)] shadow-[0_0_18px_rgba(255,82,134,0.6)]" />
				<div className="rounded-[18px] border border-fuchsia-300/28 bg-[linear-gradient(135deg,rgba(51,22,69,0.88),rgba(36,19,64,0.78))] px-3.5 py-3.5 shadow-[0_10px_30px_rgba(6,2,18,0.35)] sm:px-4 sm:py-4">
					<div className="flex items-center gap-3">
						<MentorAvatar assetSrc={mentorAssetSrc} />
						<div className="min-w-0 flex-1">
							<div className="text-[18px] font-black tracking-[-0.03em] text-white sm:text-[22px]">Alirto Sovner</div>
							<div className="truncate text-sm text-fuchsia-100/70">Vocess pedem ráts és noco melagath...</div>
						</div>
						<div className="ml-auto flex gap-1.5 text-white/55">
							<span className="h-1.5 w-1.5 rounded-full bg-current" />
							<span className="h-1.5 w-1.5 rounded-full bg-current" />
							<span className="h-1.5 w-1.5 rounded-full bg-current" />
						</div>
					</div>
				</div>
				<div className="mt-6 rounded-[18px] border border-violet-300/26 bg-[linear-gradient(180deg,rgba(64,37,106,0.88),rgba(45,28,82,0.8))] px-4 py-4 text-[18px] font-bold leading-tight text-white shadow-[0_0_24px_rgba(124,58,237,0.24)] sm:mt-7 sm:px-5 sm:py-5 sm:text-[21px]">
					Qual é o impacto dessa escolha?
				</div>
				<div className="mt-6 space-y-3 sm:mt-7 sm:space-y-3.5">
					<motion.button
						type="button"
						whileHover={{ y: -2, scale: 1.01 }}
						whileTap={{ scale: 0.988 }}
						className="flex min-h-[74px] w-full items-center gap-3 rounded-[16px] border border-fuchsia-300/42 px-4 py-3.5 text-left text-[15px] font-extrabold text-white shadow-[0_0_24px_rgba(231,76,172,0.2)] sm:min-h-[82px] sm:py-4 sm:text-[17px]"
						style={{ background: 'linear-gradient(90deg, rgba(214,53,161,0.86) 0%, rgba(118,76,244,0.68) 100%)' }}
					>
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/14 text-white">
							<Target size={18} />
						</span>
						Avaliar Novas Estratégias
					</motion.button>
					<motion.button
						type="button"
						whileHover={{ y: -2, scale: 1.01 }}
						whileTap={{ scale: 0.988 }}
						className="flex min-h-[74px] w-full items-center gap-3 rounded-[16px] border border-orange-300/38 px-4 py-3.5 text-left text-[15px] font-extrabold text-white shadow-[0_0_24px_rgba(255,113,48,0.18)] sm:min-h-[82px] sm:py-4 sm:text-[17px]"
						style={{ background: 'linear-gradient(90deg, rgba(255,157,44,0.86) 0%, rgba(232,81,49,0.82) 100%)' }}
					>
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/14 text-white">
							<Sparkles size={18} />
						</span>
						Ignorar por Enquanto
					</motion.button>
			</div>
		</div>
	);
}

function PlotTwistScene() {
	return (
		<div className="mx-auto relative h-full w-full max-w-[360px] overflow-hidden rounded-[24px] p-4 min-[400px]:max-w-[390px] sm:rounded-[28px] sm:p-5" style={innerCardStyle}>
			<TextureVeil className="opacity-25" />
			<SparkField
				points={[
					{ left: '9%', top: '12%', hue: '#ef4444' },
					{ left: '21%', top: '84%', hue: '#fb7185' },
					{ left: '74%', top: '18%', hue: '#f97316' },
					{ left: '85%', top: '62%', hue: '#ec4899' },
				]}
				className="opacity-80"
			/>
			<motion.div
				animate={{ opacity: [0.82, 1, 0.82], scale: [1, 1.015, 1] }}
				transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
				className="relative overflow-hidden rounded-[24px] border border-red-400/65 bg-[linear-gradient(180deg,rgba(86,13,18,0.95),rgba(47,8,13,0.96))] px-4 py-8 text-center shadow-[0_0_40px_rgba(255,68,68,0.28)] sm:px-5 sm:py-10"
			>
				<div className="pointer-events-none absolute inset-[10px] rounded-[18px] border border-white/6" />
				<div className="pointer-events-none absolute inset-x-8 top-6 h-[3px] rounded-full bg-[linear-gradient(90deg,transparent,#ff5b5b,transparent)] shadow-[0_0_14px_rgba(255,77,77,0.7)]" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,112,73,0.24),transparent_52%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_36%,rgba(255,87,87,0.08)_100%)]" />
				<CircleAlert className="mx-auto mb-4 h-20 w-20 text-[#ffb17d] drop-shadow-[0_0_18px_rgba(255,125,68,0.8)] sm:h-24 sm:w-24" strokeWidth={2.2} />
				<div className="text-[22px] font-black tracking-[0.16em] text-[#ffd8c6] sm:text-[26px] sm:tracking-[0.2em]">ALERTA!</div>
				<div className="mt-4 text-[22px] font-black leading-tight text-white sm:text-[38px]">
					O concorrente lançou um produto inovador!
				</div>
			</motion.div>
			<div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4">
				{[
					'A) Prometo resolver rapidamente',
					'B) Converso com o cliente e redefino expectativas',
					'C) Transfiro o problema para outro setor',
				].map((option, index) => (
					<motion.button
						key={option}
						type="button"
						whileHover={{ y: -4, scale: 1.01 }}
						whileTap={{ scale: 0.988 }}
						className="flex min-h-[80px] items-center justify-between gap-3 rounded-[18px] border px-4 py-4 text-left text-[15px] font-bold leading-snug text-white shadow-[0_12px_30px_rgba(7,3,20,0.36)] sm:min-h-[92px] sm:gap-4 sm:px-5 sm:py-5 sm:text-[17px]"
						style={{
							background: index === 0
								? 'linear-gradient(90deg, rgba(120,39,93,0.88) 0%, rgba(232,79,165,0.9) 70%, rgba(255,129,83,0.82) 100%)'
								: 'linear-gradient(180deg, rgba(53,24,76,0.88), rgba(37,19,56,0.94))',
							borderColor: index === 0 ? 'rgba(255, 141, 196, 0.46)' : 'rgba(211, 122, 255, 0.26)',
						}}
					>
						<span>{option}</span>
						<span className="text-2xl text-white/75">›</span>
					</motion.button>
				))}
			</div>
		</div>
	);
}

function DashboardScene() {
	return (
		<div className="mx-auto relative w-full max-w-[360px] overflow-hidden rounded-[24px] p-4 min-[400px]:max-w-[420px] sm:rounded-[28px] sm:p-5" style={innerCardStyle}>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_74%,rgba(88,112,255,0.16),transparent_20%),radial-gradient(circle_at_82%_70%,rgba(255,108,169,0.16),transparent_20%)]" />
			<div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,11,42,0.78),rgba(16,8,32,0.92))] p-3.5 sm:p-4">
				<TextureVeil className="opacity-24" />
				<SparkField points={stars.slice(0, 10)} className="opacity-8" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,rgba(255,84,168,0.12),transparent_28%)]" />
				<div className="mb-4 flex items-start justify-between gap-3 sm:items-center sm:gap-4">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex h-7 w-7 items-center justify-center rounded-full border border-fuchsia-300/55 text-fuchsia-200">
							<div className="h-3 w-3 rounded-full border-2 border-current" />
						</div>
						<div className="min-w-0 text-[20px] font-black tracking-[-0.03em] text-white sm:text-[30px]">Seu Progresso</div>
					</div>
					<div className="flex items-end gap-1 text-fuchsia-300">
						<span className="h-2 w-1.5 rounded-full bg-current/60" />
						<span className="h-4 w-1.5 rounded-full bg-current/80" />
						<span className="h-6 w-1.5 rounded-full bg-current" />
					</div>
				</div>
				<div className="mb-4 flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 sm:gap-4 sm:text-[13px] sm:tracking-[0.18em]">
					<span className="h-px w-7 bg-white/30 sm:w-10" />
					Competências
					<span className="h-px w-7 bg-white/30 sm:w-10" />
				</div>
				<div className="mb-3 text-center text-[12px] text-fuchsia-100/52 sm:text-sm">Radar sintético de evolução por comportamento.</div>
				<div className="relative mx-auto h-[220px] w-full max-w-[280px] sm:h-[280px] sm:max-w-[360px]">
					<div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,79,171,0.22),transparent_52%)] blur-2xl" />
					<RadarChart />
				</div>
				<div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
					{competencyBars.map((item) => (
						<div key={item.label} className="rounded-[14px] border border-white/8 bg-[rgba(20,9,35,0.55)] px-3 py-3 sm:px-4 sm:py-3.5">
							<div className="mb-2 flex items-center justify-between gap-3 text-[13px] font-bold text-white sm:text-[15px]">
								<span>{item.label}</span>
								<span className="text-[22px] font-black text-white/90 sm:text-[28px]">{item.value}</span>
							</div>
							<div className="h-3 rounded-full bg-white/10">
								<div
									className="h-full rounded-full"
									style={{
										width: `${item.value}%`,
										background: 'linear-gradient(90deg, #48bfff 0%, #7366ff 42%, #f66cc5 74%, #ffb33a 100%)',
										boxShadow: '0 0 16px rgba(104, 174, 255, 0.34)',
									}}
								/>
							</div>
						</div>
					))}
				</div>
				<div className="mt-4 flex min-h-[52px] items-center justify-center rounded-[16px] border border-fuchsia-300/42 bg-[linear-gradient(90deg,rgba(84,41,152,0.82),rgba(215,74,157,0.86),rgba(89,56,200,0.82))] px-3 text-center text-[20px] font-black tracking-[-0.03em] text-white shadow-[0_0_26px_rgba(218,78,170,0.28)] sm:mt-5 sm:min-h-[60px] sm:text-[24px]">
					Nível 4 <span className="ml-2 text-[16px] font-bold text-cyan-200 sm:text-xl">EVOLUINDO</span>
				</div>
			</div>
		</div>
	);
}

function ResultScene() {
	return (
		<div className="mx-auto relative h-full w-full max-w-[360px] overflow-hidden rounded-[26px] border border-orange-200/16 bg-[linear-gradient(180deg,rgba(53,18,44,0.8),rgba(31,11,49,0.92))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.4)] min-[400px]:max-w-[390px] sm:rounded-[30px] sm:p-5">
			<TextureVeil className="opacity-26" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,164,68,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,82,180,0.12),transparent_26%)]" />
			<SparkField
				points={[
					{ left: '12%', top: '9%', hue: '#ff7a33' },
					{ left: '24%', top: '14%', hue: '#ff4aa8' },
					{ left: '73%', top: '12%', hue: '#ff7a33' },
					{ left: '84%', top: '10%', hue: '#ec4899' },
					{ left: '19%', top: '42%', hue: '#ff7848' },
					{ left: '88%', top: '58%', hue: '#ff9958' },
				]}
				className="opacity-90"
			/>
			<div className="pt-2 text-center sm:pt-3">
				<div className="text-[36px] font-black tracking-[-0.05em] text-white drop-shadow-[0_0_18px_rgba(255,150,69,0.24)] sm:text-[46px]">Parabéns!</div>
				<div className="mt-1 text-[20px] font-extrabold text-white sm:text-[24px]">Treinamento Concluído</div>
			</div>
			<div className="mt-2 text-center text-sm font-medium text-orange-100/58">Recompensa liberada e nova trilha disponível.</div>
			<div className="mt-8 text-center text-[17px] font-black text-white/90">Seu Desempenho</div>
			<div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
				{[
					{ label: 'Avanço', value: '85%', accent: '#ffb14d' },
					{ label: 'Erros Comuns', value: '3', accent: '#ffd4a2' },
					{ label: 'Badges', value: '5/6', accent: '#ff8a32' },
				].map((stat) => (
					<div key={stat.label} className="rounded-[16px] border border-orange-200/18 bg-[linear-gradient(180deg,rgba(84,31,74,0.56),rgba(42,18,61,0.74))] px-3 py-5 text-center">
						<div className="text-[13px] font-bold text-white/75">{stat.label}</div>
						<div className="mt-2 text-[30px] font-black text-white" style={{ textShadow: `0 0 16px ${stat.accent}` }}>{stat.value}</div>
					</div>
				))}
			</div>
			<div className="mt-8 text-center text-[17px] font-black text-white/90">Próximos Passos</div>
			<div className="mx-auto mt-4 flex max-w-[560px] items-center gap-3 rounded-[18px] border border-fuchsia-300/28 bg-[linear-gradient(135deg,rgba(64,26,76,0.8),rgba(39,18,59,0.88))] px-3 py-3.5 shadow-[0_12px_28px_rgba(7,3,20,0.3)] sm:px-4 sm:py-4">
				<div className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-orange-300/45 bg-[radial-gradient(circle_at_35%_30%,rgba(255,243,181,0.88),rgba(255,128,51,0.9)_52%,rgba(110,33,16,0.95))] shadow-[0_0_20px_rgba(255,117,56,0.32)]">
					<TrendingUp size={24} className="text-white" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="text-[18px] font-black tracking-[-0.03em] text-white sm:text-[22px]">Desenvolva Sua Liderança</div>
					<div className="text-[12px] text-fuchsia-100/68 sm:text-sm">Inicie regendo novas decisões com mais precisão.</div>
				</div>
			</div>
			<div className="mx-auto mt-8 max-w-[420px]">
				<motion.button
					type="button"
					whileHover={{ y: -2, scale: 1.01 }}
					whileTap={{ scale: 0.985 }}
					className="flex h-[60px] w-full items-center justify-center rounded-[18px] border border-fuchsia-200/48 px-4 py-4 text-[18px] font-black tracking-[-0.03em] text-white shadow-[0_0_28px_rgba(236,72,153,0.28)]"
					style={{ background: 'linear-gradient(90deg, rgba(255,121,48,0.92) 0%, rgba(228,74,164,0.92) 100%)' }}
				>
					Iniciar Próxima Trilha
				</motion.button>
			</div>
		</div>
	);
}

export default function AprendeAiGameFlow({ assets = defaultAssetManifest }) {
	const [currentScene, setCurrentScene] = useState(0);
	const [selectedProfile, setSelectedProfile] = useState('Profissional');
	const resolvedAssets = {
		...defaultAssetManifest,
		...assets,
		profiles: {
			...defaultAssetManifest.profiles,
			...(assets?.profiles ?? {}),
		},
	};

	const scene = scenes[currentScene];
	const nextLabel = currentScene === scenes.length - 1 ? 'Reiniciar jornada' : currentScene === 0 ? 'Entrar no jogo' : 'Próxima tela';

	function handleNext() {
		if (currentScene === scenes.length - 1) {
			setCurrentScene(0);
			return;
		}

		setCurrentScene((value) => Math.min(value + 1, scenes.length - 1));
	}

	function handlePrev() {
		setCurrentScene((value) => Math.max(value - 1, 0));
	}

	function renderScene() {
		switch (scene.id) {
			case 'onboarding':
				return <OnboardingScene selectedProfile={selectedProfile} setSelectedProfile={setSelectedProfile} assets={resolvedAssets} />;
			case 'mapa':
				return <JourneyScene bossAssetSrc={resolvedAssets.boss} />;
			case 'missao':
				return <MissionScene mentorAssetSrc={resolvedAssets.mentor} />;
			case 'plot':
				return <PlotTwistScene />;
			case 'dashboard':
				return <DashboardScene />;
			default:
				return <ResultScene />;
		}
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#090415] text-white">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(166,57,255,0.2),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(255,67,151,0.2),transparent_18%),radial-gradient(circle_at_70%_70%,rgba(255,127,39,0.12),transparent_22%),radial-gradient(circle_at_30%_72%,rgba(83,131,255,0.12),transparent_26%),linear-gradient(180deg,#120620_0%,#0a0516_100%)]" />
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.02)_49%,transparent_50%,transparent_100%),linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.018)_49%,transparent_50%,transparent_100%)] bg-[length:120px_120px] opacity-25" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.08)_60%,rgba(0,0,0,0.28)_100%)]" />
			<AnimatePresence mode="wait">
				<motion.div
					key={scene.id}
					initial={{ opacity: 0, y: 18, scale: 0.985 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -14, scale: 0.985 }}
					transition={{ duration: 0.38, ease: 'easeOut' }}
				>
					<GameShell
						scene={scene}
						index={currentScene}
						total={scenes.length}
						onNext={handleNext}
						onPrev={handlePrev}
						nextLabel={nextLabel}
					>
						{renderScene()}
					</GameShell>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}