import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';

export interface GalleryPainting {
	id: string;
	title: string | null;
	caption: string;
	image: string;
	thumb: string;
}

interface Props {
	paintings: GalleryPainting[];
}

const INTERVAL = 5000;
const VISIBLE = 3;

interface Rect {
	left: number;
	top: number;
	width: number;
	height: number;
}

export default function HomePageGallery({ paintings }: Props) {
	const total = paintings.length;
	const visibleCount = Math.min(VISIBLE, total - 1);

	const [state, setState] = useState<number[]>(() => {
		const visible = [1, 2, 3].slice(0, visibleCount);
		const stack = Array.from({ length: total - 1 - visibleCount }, (_, i) => total - 1 - i);
		return [0, ...stack, ...visible];
	});
	const [paused, setPaused] = useState(false);
	const reduceMotion = useMemo(
		() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		[],
	);
	const timerRef = useRef<number | null>(null);

	const strip = state.slice(1);
	const stackStrip = strip.slice(0, strip.length - visibleCount);
	const visibleStrip = strip.slice(-visibleCount);
	const bigIndex = state[0];
	const big = paintings[bigIndex];

	// slot for each painting
	const slotOf = useMemo(() => {
		const map = new Map<number, { kind: 'big' } | { kind: 'stack'; pos: number } | { kind: 'thumb'; pos: number }>();
		map.set(state[0], { kind: 'big' });
		stackStrip.forEach((idx, i) => map.set(idx, { kind: 'stack', pos: i }));
		visibleStrip.forEach((idx, i) => map.set(idx, { kind: 'thumb', pos: i }));
		return map;
	}, [state, stackStrip, visibleStrip]);

	useEffect(() => {
		if (reduceMotion || paused) return;
		timerRef.current = window.setInterval(() => {
			setState((s) => [s[s.length - 1], s[0], ...s.slice(1, -1)]);
		}, INTERVAL);
		return () => {
			if (timerRef.current) window.clearInterval(timerRef.current);
		};
	}, [paused, reduceMotion]);

	const select = (targetIndex: number) => {
		setState((s) => {
			const rest = s.filter((v) => v !== targetIndex);
			return [targetIndex, ...rest];
		});
	};

	// ---- measure skeleton cells to get slot geometry ----
	const rootRef = useRef<HTMLDivElement>(null);
	const bigCellRef = useRef<HTMLDivElement>(null);
	const thumbCellRefs = useRef<(HTMLDivElement | null)[]>([]);
	const stackCellRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [layout, setLayout] = useState<{
		origin: Rect | null;
		big: Rect | null;
		thumbs: Rect[];
		stack: Rect[];
	}>({ origin: null, big: null, thumbs: [], stack: [] });

	useLayoutEffect(() => {
		const measure = () => {
			const origin = rootRef.current?.getBoundingClientRect();
			const big = bigCellRef.current?.getBoundingClientRect();
			setLayout({
				origin: origin ? toRect(origin) : null,
				big: big ? toRect(origin!, big) : null,
				thumbs: thumbCellRefs.current.map((el) => (el ? toRect(origin!, el.getBoundingClientRect()) : null)).filter(Boolean) as Rect[],
				stack: stackCellRefs.current.map((el) => (el ? toRect(origin!, el.getBoundingClientRect()) : null)).filter(Boolean) as Rect[],
			});
		};
		measure();
		const ro = new ResizeObserver(measure);
		if (rootRef.current) ro.observe(rootRef.current);
		return () => ro.disconnect();
	}, [state, total]);

	const rectOf = (slot: { kind: 'big' } | { kind: 'stack'; pos: number } | { kind: 'thumb'; pos: number }): Rect | null => {
		if (slot.kind === 'big') return layout.big;
		if (slot.kind === 'thumb') return layout.thumbs[slot.pos] ?? null;
		return layout.stack[slot.pos] ?? null;
	};

	return (
		<section className="home-gallery" data-home-gallery>
			<div className="home-gallery-inner">
				<div className="gallery-clip" ref={rootRef}>
					{/* skeleton cells define slot geometry (invisible, just for measurement + hover) */}
					<div className="cell big-cell" ref={bigCellRef} />
					{stackStrip.map((_, i) => (
						<div
							className="cell stack-cell"
							style={{ top: -((i + 1) * 210) }}
							key={i}
							ref={(el) => {
								stackCellRefs.current[i] = el;
							}}
						/>
					))}
					{visibleStrip.map((_, i) => (
						<div
							className="cell thumb-cell"
							style={{ top: i * 210 }}
							key={i}
							ref={(el) => {
								thumbCellRefs.current[i] = el;
							}}
							onMouseEnter={() => setPaused(true)}
							onMouseLeave={() => setPaused(false)}
						>
							<button
								type="button"
								className="thumb-btn"
								aria-label={`Pokaż: ${paintings[visibleStrip[i]].title ?? 'obraz bez tytułu'}`}
								onClick={() => select(visibleStrip[i])}
							>
								<span className="thumb-title">{paintings[visibleStrip[i]].title ?? 'Bez tytułu'}</span>
							</button>
						</div>
					))}

					{/* persistent painting elements */}
					{state.map((idx) => {
						const slot = slotOf.get(idx);
						if (!slot) return null;
						const rect = rectOf(slot);
						if (!rect) return null;
						const isBig = slot.kind === 'big';
						return (
							<motion.div
								key={paintings[idx].id}
								className={`gallery-item ${isBig ? 'is-big' : 'is-thumb'}`}
								initial={false}
								animate={{
									left: rect.left,
									top: rect.top,
									width: rect.width,
									height: rect.height,
								}}
								transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
							>
								{isBig ? (
									<div
										className="big-frame"
										onMouseEnter={() => setPaused(true)}
										onMouseLeave={() => setPaused(false)}
									>
										<motion.img
											src={paintings[idx].image}
											alt={paintings[idx].title ?? ''}
											className="gallery-img big"
										/>
									</div>
								) : (
									<motion.img
										src={paintings[idx].image}
										alt={paintings[idx].title ?? ''}
										className="gallery-img"
									/>
								)}
							</motion.div>
						);
					})}
				</div>

				<p className="stage-caption" aria-live="off">
					{big?.caption}
				</p>
			</div>

			<style>{css}</style>
		</section>
	);
}

function toRect(origin: DOMRect, r?: DOMRect): Rect {
	const o = origin;
	if (!r) return { left: 0, top: 0, width: 0, height: 0 };
	return { left: r.left - o.left, top: r.top - o.top, width: r.width, height: r.height };
}

const css = `
	.home-gallery {
		width: 100vw;
		margin-inline: calc(50% - 50vw);
		background-color: var(--color-surface);
		overflow: hidden;
	}
	.home-gallery-inner {
		position: relative;
		max-width: var(--container-width);
		margin-inline: auto;
		padding: var(--space-6) var(--space-4);
	}
	.gallery-clip {
		position: relative;
		height: 606px;
		overflow: hidden;
	}
	.cell {
		position: absolute;
		overflow: hidden;
	}
	.big-cell {
		left: 0;
		top: 0;
		bottom: 0;
		width: calc(100% - 261px - 61px);
	}
	.thumb-cell,
	.stack-cell {
		right: 0;
		width: 261px;
		height: 186px;
	}
	.gallery-item {
		position: absolute;
		overflow: hidden;
		pointer-events: none;
	}
	.gallery-img {
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none;
	}
	.big-frame {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.gallery-img.big {
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		pointer-events: auto;
	}
	.gallery-item.is-thumb .gallery-img {
		object-fit: cover;
		object-position: center;
	}
	.stage-caption {
		position: relative;
		width: calc(100% - 261px - 61px);
		margin-top: var(--space-3);
		margin-inline: auto;
		margin-left: 0;
		font-family: var(--font-body);
		font-size: var(--font-size-xl);
		line-height: 100%;
		color: var(--color-text);
		text-align: center;
		text-wrap: balance;
	}
	.thumb-btn {
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: none;
		text-align: left;
		cursor: pointer;
		position: relative;
		z-index: 1;
	}
	.thumb-title {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: var(--space-4) var(--space-3) var(--space-2);
		color: #fff;
		font-family: var(--font-body);
		font-size: var(--font-size-sm);
		text-align: center;
		text-wrap: balance;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
		opacity: 0;
		transition: opacity 200ms ease;
		pointer-events: none;
	}
	.thumb-btn:hover .thumb-title,
	.thumb-btn:focus-visible .thumb-title {
		opacity: 1;
	}
`;
