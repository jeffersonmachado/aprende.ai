import { motion } from 'framer-motion';
import {
	ArrowLeft,
	BriefcaseBusiness,
	CircleAlert,
	Crown,
	Flame,
	GraduationCap,
	MessageSquareText,
	Rocket,
	ShieldQuestion,
	Sparkles,
	Target,
	TrendingUp,
	UserRound,
	Zap,
} from 'lucide-react';

const profileCards = [
	{
		label: 'Profissional',
		icon: BriefcaseBusiness,
		palette: {
			from: '#6ca8ff',
			via: '#d76ad8',
			to: '#2e2148',
			head: '#f5d4c0',
			jacket: '#263d68',
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
			jacket: '#f4f2ff',
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
			jacket: '#3a2a3b',
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
			jacket: '#616f92',
			accent: '#ffd08f',
		},
	},
];

const journeySteps = [
	{ label: 'Início', icon: Zap, glow: '#56b8ff', border: '#4b6cff', active: true },
	{ label: 'Análise', icon: UserRound, glow: '#9e90ff', border: '#8674ff' },
	{ label: 'Decisão', icon: ShieldQuestion, glow: '#de85ff', border: '#cf67ff' },
	{ label: 'Reviravolta', icon: CircleAlert, glow: '#ff5cb8', border: '#ff4f94' },
	{ label: 'Estratégia', icon: MessageSquareText, glow: '#ff7fbb', border: '#ff6e97' },
];

const competencyBars = [
	{ label: 'Tomada de Decisão', value: 72 },
	{ label: 'Análise Crítica', value: 65 },
	{ label: 'Comunicação', value: 58 },
	{ label: 'Estratégia', value: 81 },
];

const radarAxes = [
	{ label: 'Estratégia', angle: -90, value: 0.82 },
	{ label: 'Comunicação', angle: -30, value: 0.58 },
	{ label: 'Tomada', angle: 30, value: 0.72 },
	{ label: 'Análise', angle: 90, value: 0.65 },
	{ label: 'Influência', angle: 150, value: 0.61 },
	{ label: 'Execução', angle: 210, value: 0.74 },
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

const onboardingSparks = [
	{ left: '5%', top: '46%', hue: '#7c3aed' },
	{ left: '20%', top: '82%', hue: '#ef4444' },
	{ left: '61%', top: '16%', hue: '#ec4899' },
	{ left: '84%', top: '86%', hue: '#f97316' },
];

const fadeInUp = (delay = 0) => ({
	initial: { opacity: 0, y: 24 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, amount: 0.35 },
	transition: { duration: 0.55, ease: 'easeOut', delay },
});

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

function PortraitTile({ label, icon: Icon, palette }) {
	return (
		<motion.button
			type="button"
			whileHover={{ y: -3, scale: 1.015 }}
			whileTap={{ scale: 0.99 }}
			className="group relative overflow-hidden rounded-[18px] border border-fuchsia-400/45 text-left"
			style={{
				background: `linear-gradient(135deg, ${palette.from}, ${palette.via} 45%, ${palette.to})`,
				boxShadow: '0 14px 32px rgba(0, 0, 0, 0.35), 0 0 26px rgba(255, 84, 199, 0.18)',
			}}
		>
			<div className="relative h-[136px] overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.34),transparent_28%),radial-gradient(circle_at_84%_28%,rgba(255,198,244,0.42),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_56%)]" />
				<div className="absolute left-3 top-3 rounded-full border border-white/35 bg-white/10 p-1.5 text-white/80 backdrop-blur-sm">
					<Icon size={14} />
				</div>
				<div
					className="absolute left-1/2 top-[24px] h-[42px] w-[42px] -translate-x-1/2 rounded-full"
					style={{ background: `radial-gradient(circle at 35% 35%, #fff5ef, ${palette.head})` }}
				/>
				<div
					className="absolute left-1/2 top-[58px] h-[78px] w-[88px] -translate-x-1/2 rounded-t-[42px] rounded-b-[16px]"
					style={{ background: `linear-gradient(180deg, ${palette.accent}, ${palette.jacket})` }}
				/>
				<div className="absolute bottom-0 left-0 right-0 h-14 bg-[linear-gradient(180deg,transparent,rgba(24,8,34,0.82)_58%,rgba(17,7,28,0.96))]" />
			</div>
			<div className="relative px-3 pb-3 pt-2">
				<span className="block text-[12px] font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,126,221,0.28)] sm:text-[15px]">
					{label}
				</span>
			</div>
			<div className="pointer-events-none absolute inset-0 rounded-[18px] border border-white/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
		</motion.button>
	);
}

function SectionLabel({ children }) {
	return (
		<div className="px-2 text-center text-[30px] font-black tracking-[-0.03em] text-[#d8b2ff] drop-shadow-[0_0_18px_rgba(224,152,255,0.24)] sm:text-[34px] lg:text-[22px] xl:text-[28px]">
			{children}
		</div>
	);
}

function NeonPanel({ children, className = '' }) {
	return (
		<motion.section
			whileHover={{ y: -4 }}
			transition={{ type: 'spring', stiffness: 220, damping: 22 }}
			className={`relative overflow-hidden rounded-[28px] ${className}`}
			style={shellCardStyle}
		>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,76,201,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(68,176,255,0.1),transparent_30%)]" />
			<div className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/5" />
			{children}
		</motion.section>
	);
}

function JourneyNode({ label, icon: Icon, glow, border, active = false }) {
	return (
		<div className="relative z-10 flex w-full flex-col items-center gap-3 text-center">
			<div
				className="flex h-14 w-14 items-center justify-center rounded-full border text-white"
				style={{
					background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.34), ${glow} 55%, rgba(25, 9, 46, 0.96))`,
					borderColor: border,
					boxShadow: active ? `0 0 0 3px rgba(120, 66, 255, 0.18), 0 0 24px ${glow}` : `0 0 18px ${glow}`,
				}}
			>
				<Icon size={20} />
			</div>
			<span className="text-[13px] font-bold text-white sm:text-[16px] lg:text-[13px] xl:text-[14px]">{label}</span>
		</div>
	);
}

function LockNode({ active = false }) {
	return (
		<div className="relative z-10 flex flex-col items-center gap-2">
			<div
				className="flex h-10 w-10 items-center justify-center rounded-full border"
				style={{
					background: active
						? 'radial-gradient(circle at 35% 35%, rgba(255,238,173,0.72), rgba(247,126,34,0.92) 56%, rgba(97,35,6,0.98))'
						: 'linear-gradient(180deg, rgba(92,70,128,0.5), rgba(42,27,69,0.7))',
					borderColor: active ? 'rgba(255, 174, 74, 0.8)' : 'rgba(173, 127, 255, 0.28)',
					boxShadow: active ? '0 0 20px rgba(255, 155, 52, 0.55)' : 'none',
				}}
			>
				<span className="text-lg font-black text-white">⌁</span>
			</div>
		</div>
	);
}

function RadarChart() {
	const rings = [16, 25, 34, 43];
	const axisPoints = radarAxes.map((axis) => polarToCartesian(axis.angle, 38));
	const valuePoints = radarAxes.map((axis) => polarToCartesian(axis.angle, 38 * axis.value));

	return (
		<svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
			<defs>
				<linearGradient id="radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="rgba(87, 151, 255, 0.95)" />
					<stop offset="50%" stopColor="rgba(255, 92, 181, 0.96)" />
					<stop offset="100%" stopColor="rgba(255, 127, 65, 0.95)" />
				</linearGradient>
				<linearGradient id="radar-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="rgba(102, 179, 255, 0.92)" />
					<stop offset="100%" stopColor="rgba(255, 103, 214, 0.92)" />
				</linearGradient>
				<filter id="radar-glow" x="-50%" y="-50%" width="200%" height="200%">
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
					key={radarAxes[index].label}
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
				fill="url(#radar-fill)"
				fillOpacity="0.75"
				stroke="url(#radar-stroke)"
				strokeWidth="1.25"
				filter="url(#radar-glow)"
			/>
			{valuePoints.map((point, index) => (
				<g key={`${radarAxes[index].label}-dot`}>
					<circle cx={point.x} cy={point.y} r="1.8" fill="#ffd6f8" filter="url(#radar-glow)" />
					<circle cx={point.x} cy={point.y} r="0.85" fill="#fff" />
				</g>
			))}
			<circle cx="50" cy="50" r="5.5" fill="rgba(255, 98, 173, 0.84)" filter="url(#radar-glow)" />
		</svg>
	);
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

export default function AprendeAiReferenceExperience() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-[#090415] text-white">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(166,57,255,0.2),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(255,67,151,0.2),transparent_18%),radial-gradient(circle_at_70%_70%,rgba(255,127,39,0.12),transparent_22%),radial-gradient(circle_at_30%_72%,rgba(83,131,255,0.12),transparent_26%),linear-gradient(180deg,#120620_0%,#0a0516_100%)]" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.08)_60%,rgba(0,0,0,0.28)_100%)]" />
			<div className="relative mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
				<div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-5">
					<motion.div {...fadeInUp(0)} className="flex flex-col gap-4 xl:col-span-3 xl:row-span-2">
						<SectionLabel>1. Onboarding</SectionLabel>
						<NeonPanel className="h-full min-h-[640px] p-4 sm:p-5">
							<SparkField points={onboardingSparks} className="opacity-80" />
							<div className="flex h-full flex-col rounded-[22px] border border-fuchsia-400/18 bg-[linear-gradient(180deg,rgba(31,11,53,0.72),rgba(16,8,30,0.56))] p-4 sm:p-5">
								<div className="mb-5 flex items-center justify-between gap-3 rounded-[18px] border border-fuchsia-300/20 bg-[linear-gradient(180deg,rgba(61,20,86,0.65),rgba(32,12,50,0.72))] px-4 py-4">
									<div className="flex items-center gap-4">
										<button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90">
											<ArrowLeft size={18} />
										</button>
										<div>
											<div className="text-2xl font-black tracking-[-0.04em] text-white sm:text-[31px] lg:text-[25px]">Escolha seu Perfil</div>
										</div>
									</div>
									<div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm font-bold text-white/90">1 de 3</div>
								</div>
								<div className="grid grid-cols-2 gap-3 sm:gap-4">
									{profileCards.map((profile) => (
										<PortraitTile key={profile.label} {...profile} />
									))}
								</div>
								<div className="mt-auto pt-6">
									<motion.button
										type="button"
										whileHover={{ y: -2, scale: 1.01 }}
										whileTap={{ scale: 0.985 }}
										className="mx-auto flex h-14 w-full max-w-[198px] items-center justify-center rounded-full border border-orange-300/55 text-xl font-black tracking-[-0.03em] text-white"
										style={{
											background: 'linear-gradient(90deg, #ff4ea3 0%, #ff7a5f 55%, #f59e0b 100%)',
											boxShadow: '0 0 24px rgba(255, 113, 113, 0.4), inset 0 1px 1px rgba(255,255,255,0.24)',
										}}
									>
										Avançar
									</motion.button>
								</div>
							</div>
						</NeonPanel>
					</motion.div>

					<motion.div {...fadeInUp(0.08)} className="flex flex-col gap-4 xl:col-span-6">
						<SectionLabel>2. Mapa da Jornada</SectionLabel>
						<NeonPanel className="min-h-[334px] p-4 sm:p-5">
							<div className="relative h-full rounded-[22px] p-5 sm:p-6" style={innerCardStyle}>
								<SparkField points={stars} className="opacity-90" />
								<div className="absolute inset-x-5 top-10 h-px bg-[linear-gradient(90deg,transparent,rgba(139,203,255,0.72),rgba(255,113,197,0.68),transparent)]" />
								<div className="absolute right-5 top-5 flex gap-2">
									{[0, 1, 2, 3].map((index) => (
										<span key={index} className="h-1.5 w-1.5 rounded-full bg-white/40" />
									))}
								</div>
								<div className="mb-10 text-center text-[28px] font-black tracking-[-0.04em] text-white sm:text-[36px] lg:text-[30px]">Sua Jornada</div>
								<div className="relative px-2 pt-8 sm:px-4">
									<div className="absolute left-[8%] right-[12%] top-[34px] h-[5px] rounded-full bg-[linear-gradient(90deg,rgba(73,113,255,0.86)_0%,rgba(167,115,255,0.9)_34%,rgba(255,77,181,0.9)_70%,rgba(255,128,33,1)_100%)] shadow-[0_0_22px_rgba(255,94,178,0.5)]" />
									<div className="grid grid-cols-6 gap-2 lg:gap-3">
										{journeySteps.map((step) => (
											<JourneyNode key={step.label} {...step} />
										))}
										<div className="relative z-10 flex flex-col items-center gap-3 text-center">
											<motion.div
												animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 22px rgba(255,130,48,0.35)', '0 0 34px rgba(255,130,48,0.75)', '0 0 22px rgba(255,130,48,0.35)'] }}
												transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
												className="relative flex h-16 w-16 items-center justify-center rounded-[18px] border border-orange-300/80 text-white"
												style={{ background: 'radial-gradient(circle at 35% 25%, rgba(255,230,168,0.86), rgba(255,123,28,0.98) 52%, rgba(98,25,5,0.98) 100%)' }}
											>
												<Flame size={30} />
												<div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle,rgba(255,228,139,0.22),transparent_60%)]" />
											</motion.div>
											<motion.div
												animate={{ opacity: [0.85, 1, 0.85] }}
												transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
												className="rounded-[18px] border border-red-400/70 bg-[linear-gradient(90deg,rgba(93,20,20,0.86),rgba(148,22,22,0.88)_45%,rgba(255,95,36,0.9))] px-4 py-2 text-[15px] font-black text-white shadow-[0_0_28px_rgba(255,76,31,0.42)] sm:text-[18px]"
											>
												Boss Final?
											</motion.div>
										</div>
									</div>
									<div className="relative mt-7 flex items-center gap-4 pl-[18%] pr-[25%]">
										<div className="absolute left-[19%] right-[27%] top-5 h-px bg-[linear-gradient(90deg,rgba(255,175,83,0.9),rgba(173,127,255,0.58))]" />
										<LockNode active />
										<LockNode />
										<LockNode />
										<LockNode />
									</div>
								</div>
								<div className="pointer-events-none absolute right-[5%] top-[24%] h-28 w-28 rounded-full bg-orange-500/28 blur-2xl" />
								<div className="pointer-events-none absolute right-[9%] top-[33%] h-20 w-20 rounded-full bg-red-500/25 blur-2xl" />
							</div>
						</NeonPanel>
					</motion.div>

					<motion.div {...fadeInUp(0.14)} className="flex flex-col gap-4 xl:col-span-3">
						<SectionLabel>3. Missão</SectionLabel>
						<NeonPanel className="min-h-[334px] p-4 sm:p-5">
							<div className="relative h-full rounded-[22px] p-4 sm:p-5" style={innerCardStyle}>
								<div className="absolute inset-x-5 top-0 h-[3px] rounded-full bg-[linear-gradient(90deg,transparent,#ff3e88_40%,#ff6c57_70%,transparent)] shadow-[0_0_18px_rgba(255,82,134,0.6)]" />
								<div className="mb-6 rounded-[18px] border border-fuchsia-300/28 bg-[linear-gradient(135deg,rgba(51,22,69,0.88),rgba(36,19,64,0.78))] px-4 py-4 shadow-[0_10px_30px_rgba(6,2,18,0.35)]">
									<div className="flex items-center gap-3">
										<div className="relative h-14 w-14 rounded-full border border-pink-300/40 bg-[radial-gradient(circle_at_35%_30%,rgba(255,223,238,0.86),rgba(222,105,186,0.9)_58%,rgba(73,19,88,0.95))]">
											<div className="absolute left-1/2 top-[10px] h-5 w-5 -translate-x-1/2 rounded-full bg-[#f6d0c4]" />
											<div className="absolute bottom-[8px] left-1/2 h-7 w-8 -translate-x-1/2 rounded-t-full bg-[#1e2f5b]" />
										</div>
										<div className="min-w-0 flex-1">
											<div className="text-[20px] font-black tracking-[-0.03em] text-white">Alirto Sovner</div>
											<div className="truncate text-sm text-fuchsia-100/70">Vocess pedem ráts és noco melagath...</div>
										</div>
										<div className="flex gap-1.5 text-white/55">
											<span className="h-1.5 w-1.5 rounded-full bg-current" />
											<span className="h-1.5 w-1.5 rounded-full bg-current" />
											<span className="h-1.5 w-1.5 rounded-full bg-current" />
										</div>
									</div>
								</div>
								<div className="relative rounded-[18px] border border-violet-300/26 bg-[linear-gradient(180deg,rgba(64,37,106,0.88),rgba(45,28,82,0.8))] px-5 py-5 text-[18px] font-bold leading-tight text-white shadow-[0_0_20px_rgba(124,58,237,0.2)] sm:text-[22px] lg:text-[18px] xl:text-[20px]">
									Qual é o impacto dessa escolha?
									<div className="absolute -bottom-3 left-10 h-5 w-5 rotate-45 border-b border-r border-violet-300/26 bg-[rgba(45,28,82,0.95)]" />
								</div>
								<div className="mt-8 space-y-4">
									<motion.button
										type="button"
										whileHover={{ y: -2, scale: 1.01 }}
										whileTap={{ scale: 0.988 }}
										className="flex w-full items-center gap-3 rounded-[16px] border border-fuchsia-300/42 px-4 py-4 text-left text-[16px] font-extrabold text-white shadow-[0_0_24px_rgba(231,76,172,0.2)]"
										style={{ background: 'linear-gradient(90deg, rgba(214,53,161,0.86) 0%, rgba(118,76,244,0.68) 100%)' }}
									>
										<span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-white">
											<Target size={16} />
										</span>
										Avaliar Novas Estratégias
									</motion.button>
									<motion.button
										type="button"
										whileHover={{ y: -2, scale: 1.01 }}
										whileTap={{ scale: 0.988 }}
										className="flex w-full items-center gap-3 rounded-[16px] border border-orange-300/38 px-4 py-4 text-left text-[16px] font-extrabold text-white shadow-[0_0_24px_rgba(255,113,48,0.18)]"
										style={{ background: 'linear-gradient(90deg, rgba(255,157,44,0.86) 0%, rgba(232,81,49,0.82) 100%)' }}
									>
										<span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-white">
											<Sparkles size={16} />
										</span>
										Ignorar por Enquanto
									</motion.button>
								</div>
							</div>
						</NeonPanel>
					</motion.div>

					<motion.div {...fadeInUp(0.18)} className="flex flex-col gap-4 xl:col-span-3">
						<SectionLabel>4. Plot Twist</SectionLabel>
						<NeonPanel className="min-h-[530px] p-4 sm:p-5">
							<div className="relative h-full rounded-[22px] p-4 sm:p-5" style={innerCardStyle}>
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
									className="relative overflow-hidden rounded-[22px] border border-red-400/65 bg-[linear-gradient(180deg,rgba(86,13,18,0.95),rgba(47,8,13,0.96))] px-5 py-8 text-center shadow-[0_0_40px_rgba(255,68,68,0.28)]"
								>
									<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,112,73,0.24),transparent_52%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_36%,rgba(255,87,87,0.08)_100%)]" />
									<CircleAlert className="mx-auto mb-4 h-20 w-20 text-[#ffb17d] drop-shadow-[0_0_18px_rgba(255,125,68,0.8)]" strokeWidth={2.2} />
									<div className="text-[22px] font-black tracking-[0.2em] text-[#ffd8c6]">ALERTA!</div>
									<div className="mt-4 text-[20px] font-black leading-tight text-white sm:text-[28px] lg:text-[22px] xl:text-[26px]">
										O concorrente lançou um produto inovador!
									</div>
								</motion.div>
								<div className="mt-6 space-y-4">
									{[
										'A) Prometo resolver rapidamente.',
										'B) Converso com o cliente e redefino expectativas.',
										'C) Transfiro o problema para outro setor.',
									].map((option, index) => (
										<motion.button
											key={option}
											type="button"
											whileHover={{ x: 4, scale: 1.01 }}
											whileTap={{ scale: 0.988 }}
											className="flex w-full items-center justify-between gap-4 rounded-[16px] border px-4 py-4 text-left text-[15px] font-bold leading-snug text-white shadow-[0_10px_28px_rgba(7,3,20,0.34)]"
											style={{
												background: index === 0
													? 'linear-gradient(90deg, rgba(120,39,93,0.88) 0%, rgba(232,79,165,0.9) 70%, rgba(255,129,83,0.82) 100%)'
													: 'linear-gradient(180deg, rgba(53,24,76,0.88), rgba(37,19,56,0.94))',
												borderColor: index === 0 ? 'rgba(255, 141, 196, 0.46)' : 'rgba(211, 122, 255, 0.26)',
											}}
										>
											<span>{option}</span>
											<span className="text-xl text-white/75">›</span>
										</motion.button>
									))}
								</div>
							</div>
						</NeonPanel>
					</motion.div>

					<motion.div {...fadeInUp(0.22)} className="flex flex-col gap-4 xl:col-span-6">
						<SectionLabel>5. Dashboard de Competências</SectionLabel>
						<NeonPanel className="min-h-[530px] p-4 sm:p-5">
							<div className="relative h-full rounded-[22px] p-4 sm:p-5" style={innerCardStyle}>
								<SparkField
									points={[
										...stars.slice(0, 10),
										{ left: '78%', top: '28%', size: 24, opacity: 0.1, hue: 'rgba(255, 110, 89, 0.9)' },
										{ left: '13%', top: '56%', size: 18, opacity: 0.08, hue: 'rgba(88, 156, 255, 0.9)' },
									]}
									className="opacity-85"
								/>
								<div className="mb-5 flex items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<div className="flex h-7 w-7 items-center justify-center rounded-full border border-fuchsia-300/55 text-fuchsia-200">
											<div className="h-3 w-3 rounded-full border-2 border-current" />
										</div>
										<div className="text-[24px] font-black tracking-[-0.03em] text-white sm:text-[30px] lg:text-[24px] xl:text-[28px]">Seu Progresso</div>
									</div>
									<div className="flex items-end gap-1 text-fuchsia-300">
										<span className="h-2 w-1.5 rounded-full bg-current/60" />
										<span className="h-4 w-1.5 rounded-full bg-current/80" />
										<span className="h-6 w-1.5 rounded-full bg-current" />
									</div>
								</div>
								<div className="mb-4 flex items-center justify-center gap-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white/80">
									<span className="h-px w-10 bg-white/30" />
									Competências
									<span className="h-px w-10 bg-white/30" />
								</div>
								<div className="relative mx-auto h-[220px] w-full max-w-[330px] sm:h-[250px] sm:max-w-[360px]">
									<div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,79,171,0.22),transparent_52%)] blur-2xl" />
									<RadarChart />
								</div>
								<div className="mt-5 space-y-3">
									{competencyBars.map((item) => (
										<div key={item.label} className="rounded-[15px] border border-white/8 bg-[rgba(20,9,35,0.55)] px-3 py-3">
											<div className="flex items-center gap-3">
												<div className="min-w-0 flex-1">
													<div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-white sm:text-[15px]">
														<span>{item.label}</span>
														<span className="text-[16px] font-black text-white/90">{item.value}</span>
													</div>
													<div className="h-2.5 rounded-full bg-white/10">
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
											</div>
										</div>
									))}
								</div>
								<div className="mt-5 flex h-14 items-center justify-center rounded-[16px] border border-fuchsia-300/42 bg-[linear-gradient(90deg,rgba(84,41,152,0.82),rgba(215,74,157,0.86),rgba(89,56,200,0.82))] text-center text-[22px] font-black tracking-[-0.03em] text-white shadow-[0_0_26px_rgba(218,78,170,0.28)]">
									Nível 4 <span className="ml-2 text-lg font-bold text-cyan-200">EVOLUINDO</span>
								</div>
							</div>
						</NeonPanel>
					</motion.div>

					<motion.div {...fadeInUp(0.26)} className="flex flex-col gap-4 xl:col-span-3">
						<SectionLabel>6. Resultado Final</SectionLabel>
						<NeonPanel className="min-h-[530px] p-4 sm:p-5">
							<div className="relative h-full rounded-[22px] p-4 sm:p-5" style={innerCardStyle}>
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
								<div className="pt-2 text-center">
									<div className="text-[40px] font-black tracking-[-0.05em] text-white drop-shadow-[0_0_18px_rgba(255,150,69,0.24)] sm:text-[54px] lg:text-[42px] xl:text-[50px]">Parabéns!</div>
									<div className="mt-1 text-[22px] font-extrabold text-white sm:text-[28px] lg:text-[22px] xl:text-[24px]">Treinamento Concluído</div>
								</div>
								<div className="mt-7 text-center text-[17px] font-black text-white/90">Seu Desempenho</div>
								<div className="mt-4 grid grid-cols-3 gap-3">
									{[
										{ label: 'Avanço', value: '85%', accent: '#ffb14d' },
										{ label: 'Erros Comuns', value: '3', accent: '#ffd4a2' },
										{ label: 'Badges', value: '5/6', accent: '#ff8a32' },
									].map((stat) => (
										<div key={stat.label} className="rounded-[16px] border border-orange-200/18 bg-[linear-gradient(180deg,rgba(84,31,74,0.56),rgba(42,18,61,0.74))] px-3 py-4 text-center">
											<div className="text-[12px] font-bold text-white/75 sm:text-[13px]">{stat.label}</div>
											<div className="mt-2 text-[20px] font-black text-white sm:text-[28px] lg:text-[22px] xl:text-[28px]" style={{ textShadow: `0 0 16px ${stat.accent}` }}>{stat.value}</div>
										</div>
									))}
								</div>
								<div className="mt-7 text-center text-[17px] font-black text-white/90">Próximos Passos</div>
								<div className="mt-4 flex items-center gap-3 rounded-[18px] border border-fuchsia-300/28 bg-[linear-gradient(135deg,rgba(64,26,76,0.8),rgba(39,18,59,0.88))] px-4 py-4 shadow-[0_12px_28px_rgba(7,3,20,0.3)]">
									<div className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-orange-300/45 bg-[radial-gradient(circle_at_35%_30%,rgba(255,243,181,0.88),rgba(255,128,51,0.9)_52%,rgba(110,33,16,0.95))] shadow-[0_0_20px_rgba(255,117,56,0.32)]">
										<TrendingUp size={24} className="text-white" />
									</div>
									<div>
										<div className="text-[20px] font-black tracking-[-0.03em] text-white">Desenvolva Sua Liderança</div>
										<div className="text-sm text-fuchsia-100/68">Inicie regendo novas decisões com mais precisão.</div>
									</div>
								</div>
								<div className="mt-auto pt-6">
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
						</NeonPanel>
					</motion.div>
				</div>
			</div>
		</div>
	);
}