import { useEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay, { type AutoplayType } from 'embla-carousel-autoplay';
import * as styles from './MobileGallery.css';
import type { GalleryPainting } from '../adapter';

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
		() => Autoplay({ delay: AUTOPLAY_INTERVAL, stopOnInteraction: false, playOnInit: true }),
		[],
	);
	const autoplayRef = useRef<AutoplayType | null>(null);
	const resumeTimer = useRef<number | null>(null);

	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, reduceMotion ? [] : [autoplay]);
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
							key={p.id}
							type="button"
							className={i === selectedIndex ? `${styles.dot} ${styles.dotActive}` : styles.dot}
							aria-label={`Pokaż: ${p.title ?? 'obraz bez tytułu'}`}
							aria-current={i === selectedIndex}
							onClick={() => emblaApi?.scrollTo(i)}
						/>
					))}
				</div>
			</div>
			<p className={styles.title} aria-live="off">
				{active?.caption}
			</p>
			<div
				className={styles.viewport}
				ref={emblaRef}
				onPointerDown={stopAutoplay}
				onPointerUp={scheduleResume}
				onPointerCancel={scheduleResume}
			>
				<div className={styles.container}>
					{paintings.map((p) => (
						<div className={styles.slide} key={p.id}>
							<img
								src={p.mobile}
								srcSet={p.srcset}
								sizes="100vw"
								alt={p.title ?? ''}
								className={styles.img}
								loading="lazy"
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
