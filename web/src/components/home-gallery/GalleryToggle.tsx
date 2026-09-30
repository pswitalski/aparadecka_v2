import pauseIcon from '../../icons/pause.svg?raw';
import playIcon from '../../icons/play.svg?raw';
import * as styles from './GalleryToggle.css';

interface Props {
	className?: string;
	onToggle: () => void;
	paused: boolean;
}

export default function GalleryToggle({ className, onToggle, paused }: Props) {
	return (
		<button
			aria-label={paused ? 'Wznów automatyczne przewijanie' : 'Wstrzymaj automatyczne przewijanie'}
			className={className}
			onClick={onToggle}
			type="button"
		>
			<span
				aria-hidden="true"
				className={styles.icon}
				dangerouslySetInnerHTML={{ __html: paused ? playIcon : pauseIcon }}
			/>
		</button>
	);
}
