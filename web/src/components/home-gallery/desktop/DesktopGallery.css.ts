import { style } from '@vanilla-extract/css';

import { CLIP_HEIGHT, SIDE_GAP, THUMB_HEIGHT, THUMB_WIDTH } from './geometry';

export const homeGallery = style({
	'@media': {
		'(max-width: 767px)': {
			display: 'none',
		},
	},
	backgroundColor: 'var(--color-surface)',
	marginInline: 'calc(50% - 50vw)',
	overflow: 'hidden',
	width: '100vw',
});

export const inner = style({
	marginInline: 'auto',
	maxWidth: 'var(--container-width)',
	padding: 'var(--space-6) var(--space-4)',
	position: 'relative',
});

export const clip = style({
	height: CLIP_HEIGHT,
	overflow: 'hidden',
	position: 'relative',
});

export const cell = style({
	overflow: 'hidden',
	position: 'absolute',
});

export const bigCell = style({
	bottom: 0,
	left: 0,
	top: 0,
	width: `calc(100% - ${THUMB_WIDTH}px - ${SIDE_GAP}px)`,
});

export const sideCell = style({
	height: THUMB_HEIGHT,
	right: 0,
	width: THUMB_WIDTH,
});

export const item = style({
	overflow: 'hidden',
	pointerEvents: 'none',
	position: 'absolute',
});

export const galleryImg = style({
	display: 'block',
	height: '100%',
	pointerEvents: 'none',
	width: '100%',
});

export const bigFrame = style({
	alignItems: 'center',
	display: 'flex',
	height: '100%',
	justifyContent: 'center',
	overflow: 'hidden',
	width: '100%',
});

export const bigImg = style({
	height: 'auto',
	maxHeight: '100%',
	maxWidth: '100%',
	objectFit: 'contain',
	pointerEvents: 'auto',
	width: 'auto',
});

export const thumbImg = style({
	objectFit: 'cover',
	objectPosition: 'center',
});

export const caption = style({
	color: 'var(--color-text)',
	fontFamily: 'var(--font-body)',
	fontSize: 'var(--font-size-xl)',
	lineHeight: '100%',
	marginInline: 'auto',
	marginLeft: 0,
	marginTop: 'var(--space-3)',
	position: 'relative',
	textAlign: 'center',
	textWrap: 'balance',
	width: `calc(100% - ${THUMB_WIDTH}px - ${SIDE_GAP}px)`,
});

export const thumbBtn = style({
	background: 'none',
	border: 0,
	cursor: 'pointer',
	display: 'block',
	height: '100%',
	padding: 0,
	position: 'relative',
	textAlign: 'left',
	width: '100%',
	zIndex: 1,
});

export const thumbTitle = style({
	background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.5))',
	bottom: 0,
	color: '#fff',
	fontFamily: 'var(--font-body)',
	fontSize: 'var(--font-size-sm)',
	left: 0,
	opacity: 0,
	padding: 'var(--space-4) var(--space-3) var(--space-2)',
	pointerEvents: 'none',
	position: 'absolute',
	right: 0,
	selectors: {
		[`.${thumbBtn}:hover &, .${thumbBtn}:focus-visible &`]: {
			opacity: 1,
		},
	},
	textAlign: 'center',
	textWrap: 'balance',
	transition: 'opacity 200ms ease',
});
