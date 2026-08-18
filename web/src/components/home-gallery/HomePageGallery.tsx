import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { staticGeometryOf, THUMB_STEP, toRect, type Rect, type Slot } from './HomePageGallery.geometry';
import * as styles from './HomePageGallery.css';
import type { GalleryPainting } from './HomePageGallery.adapter';

interface Props {
	paintings: GalleryPainting[];
}

const INTERVAL = 5000;
const VISIBLE = 3;

export default function HomePageGallery({ paintings }: Props) {
	const total = paintings.length;
	const visibleCount = Math.min(VISIBLE, total - 1);

	const [order, setOrder] = useState<number[]>(() => {
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

	const strip = order.slice(1);
	const stackStrip = strip.slice(0, strip.length - visibleCount);
	const visibleStrip = strip.slice(-visibleCount);
	const bigIndex = order[0];
	const big = paintings[bigIndex];

	// slot for each painting
	const slotOf = useMemo(() => {
		const map = new Map<number, Slot>();
		map.set(order[0], { kind: 'big' });
		stackStrip.forEach((idx, i) => map.set(idx, { kind: 'stack', pos: i }));
		visibleStrip.forEach((idx, i) => map.set(idx, { kind: 'thumb', pos: i }));
		return map;
	}, [order, stackStrip, visibleStrip]);

	useEffect(() => {
		if (reduceMotion || paused) return;
		timerRef.current = window.setInterval(() => {
			setOrder((prev) => [prev[prev.length - 1], prev[0], ...prev.slice(1, -1)]);
		}, INTERVAL);
		return () => {
			if (timerRef.current) window.clearInterval(timerRef.current);
		};
	}, [paused, reduceMotion]);

	const select = (targetIndex: number) => {
		setOrder((prev) => {
			const rest = prev.filter((v) => v !== targetIndex);
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
	}, [order, total]);

	const rectOf = (slot: Slot): Rect | null => {
		if (slot.kind === 'big') return layout.big;
		if (slot.kind === 'thumb') return layout.thumbs[slot.pos] ?? null;
		return layout.stack[slot.pos] ?? null;
	};

	return (
		<section className={styles.homeGallery} data-home-gallery>
			<div className={styles.inner}>
				<div className={styles.clip} ref={rootRef}>
					{/* skeleton cells define slot geometry (invisible, just for measurement + hover) */}
					<div className={`${styles.cell} ${styles.bigCell}`} ref={bigCellRef} />
					{stackStrip.map((_, i) => (
						<div
							className={`${styles.cell} ${styles.sideCell}`}
							style={{ top: -((i + 1) * THUMB_STEP) }}
							key={i}
							ref={(el) => {
								stackCellRefs.current[i] = el;
							}}
						/>
					))}
					{visibleStrip.map((_, i) => (
						<div
							className={`${styles.cell} ${styles.sideCell}`}
							style={{ top: i * THUMB_STEP }}
							key={i}
							ref={(el) => {
								thumbCellRefs.current[i] = el;
							}}
							onMouseEnter={() => setPaused(true)}
							onMouseLeave={() => setPaused(false)}
						>
							<button
								type="button"
								className={styles.thumbBtn}
								aria-label={`Pokaż: ${paintings[visibleStrip[i]].title ?? 'obraz bez tytułu'}`}
								onClick={() => select(visibleStrip[i])}
							>
								<span className={styles.thumbTitle}>{paintings[visibleStrip[i]].title ?? 'Bez tytułu'}</span>
							</button>
						</div>
					))}

					{/* persistent painting elements */}
					{order.map((idx) => {
						const slot = slotOf.get(idx);
						if (!slot) return null;
						const rect = rectOf(slot);
						const isBig = slot.kind === 'big';
						const staticGeom = staticGeometryOf(slot);
						return (
							<motion.div
								key={paintings[idx].id}
								className={styles.item}
								style={{
									left: staticGeom.left,
									top: staticGeom.top,
									width: staticGeom.width,
									height: staticGeom.height,
								}}
								initial={false}
								animate={
									rect
										? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
										: undefined
								}
								transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
							>
								{isBig ? (
									<div
										className={styles.bigFrame}
										onMouseEnter={() => setPaused(true)}
										onMouseLeave={() => setPaused(false)}
									>
										<motion.img
											src={paintings[idx].image}
											alt={paintings[idx].title ?? ''}
											className={`${styles.galleryImg} ${styles.bigImg}`}
										/>
									</div>
								) : (
									<motion.img
										src={paintings[idx].image}
										alt={paintings[idx].title ?? ''}
										className={`${styles.galleryImg} ${styles.thumbImg}`}
									/>
								)}
							</motion.div>
						);
					})}
				</div>

				<p className={styles.caption} aria-live="off">
					{big?.caption}
				</p>
			</div>
		</section>
	);
}
