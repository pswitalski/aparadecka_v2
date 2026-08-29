import Autoplay, { type AutoplayType } from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { GalleryPainting } from '../adapter';

import * as styles from './MobileGallery.css';

interface Props {
	paintings: GalleryPainting[];
}

const AUTOPLAY_INTERVAL = 5000;
const RESUME_DELAY = 5000;

export default function MobileGallery({ paintings }: Props) {
	const reduceMotion = useMemo(
		() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		[],
	);
	const autoplay = useMemo(
		() => Autoplay({ delay: AUTOPLAY_INTERVAL, playOnInit: true, stopOnInteraction: false }),
		[],
	);
	const autoplayRef = useRef<AutoplayType | null>(null);
	const resumeTimer = useRef<null | number>(null);

	const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true }, reduceMotion ? [] : [autoplay]);
	const [selectedIndex, setSelectedIndex] = useState(0);

	useEffect(() => {
		autoplayRef.current = autoplay;
		return () => {
			autoplayRef.current = null;
			if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
		};
	}, [autoplay]);

	useEffect(() => {
		if (!emblaApi) return;
		const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
		emblaApi.on('select', onSelect);
		onSelect();
		return () => {
			emblaApi.off('select', onSelect);
		};
	}, [emblaApi]);

	const stopAutoplay = () => {
		autoplayRef.current?.stop();
		if (resumeTimer.current) {
			window.clearTimeout(resumeTimer.current);
			resumeTimer.current = null;
		}
	};

	const scheduleResume = () => {
		if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
		resumeTimer.current = window.setTimeout(() => {
			autoplayRef.current?.play();
			resumeTimer.current = null;
		}, RESUME_DELAY);
	};

	const active = paintings[selectedIndex] ?? paintings[0];

	if (paintings.length === 0) return null;

	return (
		<section className={styles.carousel} data-home-carousel>
			<div className={styles.dotsBar}>
				<div className={styles.dots}>
					{paintings.map((p, i) => (
						<button
							aria-current={i === selectedIndex}
							aria-label={`Pokaż: ${p.title ?? 'obraz bez tytułu'}`}
							className={i === selectedIndex ? `${styles.dot} ${styles.dotActive}` : styles.dot}
							key={p.id}
							onClick={() => emblaApi?.scrollTo(i)}
							type="button"
						/>
					))}
				</div>
			</div>
			<p aria-live="off" className={styles.title}>
				{active?.caption}
			</p>
			<div
				className={styles.viewport}
				onPointerCancel={scheduleResume}
				onPointerDown={stopAutoplay}
				onPointerUp={scheduleResume}
				ref={emblaRef}
			>
				<div className={styles.container}>
					{paintings.map((p) => (
						<div className={styles.slide} key={p.id}>
							<img
								alt={p.title ?? ''}
								className={styles.img}
								loading="lazy"
								sizes="100vw"
								src={p.mobile}
								srcSet={p.srcset}
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
