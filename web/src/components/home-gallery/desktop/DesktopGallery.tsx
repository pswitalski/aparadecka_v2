import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { GalleryPainting } from '../adapter';

import * as styles from './DesktopGallery.css';
import { pixelGeometryOf, SIDE_GAP, type Slot, staticGeometryOf, THUMB_STEP, THUMB_WIDTH } from './geometry';

interface Props {
	paintings: GalleryPainting[];
}

const INTERVAL = 5000;
const VISIBLE = 3;
/* The big slot is the clip width minus the thumbnail column, and the clip is the content box
   of `main` (max-width 1200px, 1rem inline padding). Sizing the file against this keeps the
   hero from being upscaled on a 2x screen; the thumbnails share the same srcset so the element
   never swaps files as it morphs between slots. */
const GALLERY_SIZES = `calc(min(100vw, 1200px) - 2rem - ${THUMB_WIDTH + SIDE_GAP}px)`;

export default function DesktopGallery({ paintings }: Props) {
	const total = paintings.length;
	const visibleCount = Math.min(VISIBLE, total - 1);

	const [order, setOrder] = useState<number[]>(() => {
		const visible = [1, 2, 3].slice(0, visibleCount);
		const stack = Array.from({ length: total - 1 - visibleCount }, (_, i) => total - 1 - i);
		return [0, ...stack, ...visible];
	});
	const [paused, setPaused] = useState(false);
	const [revealedThumb, setRevealedThumb] = useState<null | number>(null);
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

	// ---- measure the clip once; every slot rect is derived from its width ----
	const rootRef = useRef<HTMLDivElement>(null);
	const [clipWidth, setClipWidth] = useState<null | number>(null);

	useLayoutEffect(() => {
		const measure = () => setClipWidth(rootRef.current?.clientWidth ?? null);

		measure();
		const ro = new ResizeObserver(measure);
		if (rootRef.current) ro.observe(rootRef.current);
		return () => ro.disconnect();
	}, []);

	if (paintings.length === 0) return null;

	return (
		<section className={styles.homeGallery} data-home-gallery>
			<div className={styles.inner}>
				<div className={styles.clip} ref={rootRef}>
					{/* visible thumbnail cells: hover-pause regions + the click targets */}
					{visibleStrip.map((_, i) => (
						<div
							className={`${styles.cell} ${styles.sideCell}`}
							key={i}
							onMouseEnter={() => {
								setPaused(true);
								setRevealedThumb(i);
							}}
							onMouseLeave={() => {
								setPaused(false);
								setRevealedThumb(null);
							}}
							style={{ top: i * THUMB_STEP }}
						>
							<button
								aria-label={`Pokaż: ${paintings[visibleStrip[i]].title ?? 'obraz bez tytułu'}`}
								className={styles.thumbBtn}
								onBlur={() => setRevealedThumb(null)}
								onClick={() => select(visibleStrip[i])}
								onFocus={() => setRevealedThumb(i)}
								type="button"
							/>
						</div>
					))}

					{/* persistent painting elements */}
					{order.map((idx) => {
						const slot = slotOf.get(idx);
						if (!slot) return null;
						const hasGeometry = clipWidth !== null;
						const rect = hasGeometry ? pixelGeometryOf(slot, clipWidth) : null;
						const isBig = slot.kind === 'big';
						return (
							<motion.div
								animate={rect ?? undefined}
								className={styles.item}
								data-painting-item
								data-slot={slot.kind}
								initial={rect ?? false}
								key={hasGeometry ? paintings[idx].id : `${paintings[idx].id}-ssr`}
								style={hasGeometry ? undefined : staticGeometryOf(slot)}
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
											fetchPriority="high"
											loading="eager"
											sizes={GALLERY_SIZES}
											src={paintings[idx].image}
											srcSet={paintings[idx].desktopSrcset}
										/>
									</div>
								) : (
									<>
										<motion.img
											alt={paintings[idx].title ?? ''}
											className={`${styles.galleryImg} ${styles.thumbImg}`}
											loading="lazy"
											sizes={GALLERY_SIZES}
											src={paintings[idx].image}
											srcSet={paintings[idx].desktopSrcset}
										/>
										{slot.kind === 'thumb' && (
											<span
												className={styles.thumbTitle}
												data-visible={slot.pos === revealedThumb ? 'true' : undefined}
											>
												{paintings[idx].title ?? 'Bez tytułu'}
											</span>
										)}
									</>
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
