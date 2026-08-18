import { style } from '@vanilla-extract/css';
import { CLIP_HEIGHT, SIDE_GAP, THUMB_HEIGHT, THUMB_WIDTH } from './geometry';

export const homeGallery = style({
	width: '100vw',
	marginInline: 'calc(50% - 50vw)',
	backgroundColor: 'var(--color-surface)',
	overflow: 'hidden',
	'@media': {
		'(max-width: 767px)': {
			display: 'none',
		},
	},
});

export const inner = style({
	position: 'relative',
	maxWidth: 'var(--container-width)',
	marginInline: 'auto',
	padding: 'var(--space-6) var(--space-4)',
});

export const clip = style({
	position: 'relative',
	height: CLIP_HEIGHT,
	overflow: 'hidden',
});

export const cell = style({
	position: 'absolute',
	overflow: 'hidden',
});

export const bigCell = style({
	left: 0,
	top: 0,
	bottom: 0,
	width: `calc(100% - ${THUMB_WIDTH}px - ${SIDE_GAP}px)`,
});

export const sideCell = style({
	right: 0,
	width: THUMB_WIDTH,
	height: THUMB_HEIGHT,
});

export const item = style({
	position: 'absolute',
	overflow: 'hidden',
	pointerEvents: 'none',
});

export const galleryImg = style({
	width: '100%',
	height: '100%',
	display: 'block',
	pointerEvents: 'none',
});

export const bigFrame = style({
	width: '100%',
	height: '100%',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	overflow: 'hidden',
});

export const bigImg = style({
	width: 'auto',
	height: 'auto',
	maxWidth: '100%',
	maxHeight: '100%',
	objectFit: 'contain',
	pointerEvents: 'auto',
});

export const thumbImg = style({
	objectFit: 'cover',
	objectPosition: 'center',
});

export const caption = style({
	position: 'relative',
	width: `calc(100% - ${THUMB_WIDTH}px - ${SIDE_GAP}px)`,
	marginTop: 'var(--space-3)',
	marginInline: 'auto',
	marginLeft: 0,
	fontFamily: 'var(--font-body)',
	fontSize: 'var(--font-size-xl)',
	lineHeight: '100%',
	color: 'var(--color-text)',
	textAlign: 'center',
	textWrap: 'balance',
});

export const thumbBtn = style({
	display: 'block',
	width: '100%',
	height: '100%',
	padding: 0,
	border: 0,
	background: 'none',
	textAlign: 'left',
	cursor: 'pointer',
	position: 'relative',
	zIndex: 1,
});

export const thumbTitle = style({
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	padding: 'var(--space-4) var(--space-3) var(--space-2)',
	color: '#fff',
	fontFamily: 'var(--font-body)',
	fontSize: 'var(--font-size-sm)',
	textAlign: 'center',
	textWrap: 'balance',
	background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.5))',
	opacity: 0,
	transition: 'opacity 200ms ease',
	pointerEvents: 'none',
	selectors: {
		[`.${thumbBtn}:hover &, .${thumbBtn}:focus-visible &`]: {
			opacity: 1,
		},
	},
});
