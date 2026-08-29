import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { GalleryPainting } from '../adapter';

import * as styles from './DesktopGallery.css';
import { type Rect, type Slot, staticGeometryOf, THUMB_STEP, toRect } from './geometry';

interface Props {
	paintings: GalleryPainting[];
}

const INTERVAL = 5000;
const VISIBLE = 3;

export default function DesktopGallery({ paintings }: Props) {
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
	const timerRef = useRef<null | number>(null);

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
		big: null | Rect;
		origin: null | Rect;
		stack: Rect[];
		thumbs: Rect[];
	}>({ big: null, origin: null, stack: [], thumbs: [] });

	useLayoutEffect(() => {
		const measure = () => {
			const origin = rootRef.current?.getBoundingClientRect();
			const big = bigCellRef.current?.getBoundingClientRect();
			setLayout({
				big: big ? toRect(origin!, big) : null,
				origin: origin ? toRect(origin) : null,
				stack: stackCellRefs.current.map((el) => (el ? toRect(origin!, el.getBoundingClientRect()) : null)).filter(Boolean) as Rect[],
				thumbs: thumbCellRefs.current.map((el) => (el ? toRect(origin!, el.getBoundingClientRect()) : null)).filter(Boolean) as Rect[],
			});
		};
		measure();
		const ro = new ResizeObserver(measure);
		if (rootRef.current) ro.observe(rootRef.current);
		return () => ro.disconnect();
	}, [order, total]);

	const rectOf = (slot: Slot): null | Rect => {
		if (slot.kind === 'big') return layout.big;
		if (slot.kind === 'thumb') return layout.thumbs[slot.pos] ?? null;
		return layout.stack[slot.pos] ?? null;
	};

	if (paintings.length === 0) return null;

	return (
		<section className={styles.homeGallery} data-home-gallery>
			<div className={styles.inner}>
				<div className={styles.clip} ref={rootRef}>
					{/* skeleton cells define slot geometry (invisible, just for measurement + hover) */}
					<div className={`${styles.cell} ${styles.bigCell}`} ref={bigCellRef} />
					{stackStrip.map((_, i) => (
						<div
							className={`${styles.cell} ${styles.sideCell}`}
							key={i}
							ref={(el) => {
								stackCellRefs.current[i] = el;
							}}
							style={{ top: -((i + 1) * THUMB_STEP) }}
						/>
					))}
					{visibleStrip.map((_, i) => (
						<div
							className={`${styles.cell} ${styles.sideCell}`}
							key={i}
							onMouseEnter={() => setPaused(true)}
							onMouseLeave={() => setPaused(false)}
							ref={(el) => {
								thumbCellRefs.current[i] = el;
							}}
							style={{ top: i * THUMB_STEP }}
						>
							<button
								aria-label={`Pokaż: ${paintings[visibleStrip[i]].title ?? 'obraz bez tytułu'}`}
								className={styles.thumbBtn}
								onClick={() => select(visibleStrip[i])}
								type="button"
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
								animate={
									rect
										? { height: rect.height, left: rect.left, top: rect.top, width: rect.width }
										: undefined
								}
								className={styles.item}
								initial={false}
								key={paintings[idx].id}
								style={{
									height: staticGeom.height,
									left: staticGeom.left,
									top: staticGeom.top,
									width: staticGeom.width,
								}}
								transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
							>
								{isBig ? (
									<div
										className={styles.bigFrame}
										onMouseEnter={() => setPaused(true)}
										onMouseLeave={() => setPaused(false)}
									>
										<motion.img
											alt={paintings[idx].title ?? ''}
											className={`${styles.galleryImg} ${styles.bigImg}`}
											loading="lazy"
											src={paintings[idx].image}
										/>
									</div>
								) : (
									<motion.img
										alt={paintings[idx].title ?? ''}
										className={`${styles.galleryImg} ${styles.thumbImg}`}
										loading="lazy"
										src={paintings[idx].image}
									/>
								)}
							</motion.div>
						);
					})}
				</div>

				<p aria-live="off" className={styles.caption}>
					{big?.caption}
				</p>
			</div>
		</section>
	);
}
