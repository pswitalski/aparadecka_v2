import { style } from '@vanilla-extract/css';

export const carousel = style({
	display: 'flex',
	flexDirection: 'column',
	/* Full-bleed inside `main` (padding var(--space-4)) and fill the viewport below the
	   mobile header down to the bottom edge (margin-bottom cancels main's bottom padding). */
	width: 'calc(100% + 2 * var(--space-4))',
	marginInline: 'calc(-1 * var(--space-4))',
	marginBottom: 'calc(-1 * var(--space-4))',
	backgroundColor: 'var(--color-surface)',
	height: 'calc(100dvh - var(--header-height-mobile) - var(--space-4))',
	overflow: 'hidden',
	'@media': {
		'(min-width: 768px)': {
			display: 'none',
		},
	},
});

export const dotsBar = style({
	flex: '0 0 auto',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	minHeight: 'var(--space-6)',
	padding: '0 var(--space-4)',
	backgroundColor: 'var(--color-bg)',
});

export const dots = style({
	display: 'flex',
	gap: 'var(--space-2)',
});

export const dot = style({
	width: 9,
	height: 9,
	padding: 0,
	border: 0,
	borderRadius: 0,
	backgroundColor: '#D9D9D9',
	cursor: 'pointer',
	transition: 'background-color 200ms ease',
});

export const dotActive = style({
	backgroundColor: '#BEACAC',
});

export const title = style({
	flex: '0 0 auto',
	padding: 'var(--space-3) var(--space-4)',
	fontFamily: 'var(--font-body)',
	fontSize: 'var(--font-size-lg)',
	lineHeight: '100%',
	color: 'var(--color-text)',
	textAlign: 'center',
	textWrap: 'balance',
	backgroundColor: 'var(--color-surface)',
});

export const viewport = style({
	flex: 1,
	minHeight: 0,
	overflow: 'hidden',
	touchAction: 'pan-y',
});

export const container = style({
	display: 'flex',
	height: '100%',
});

export const slide = style({
	flex: '0 0 100%',
	minWidth: 0,
	height: '100%',
	overflow: 'hidden',
});

export const img = style({
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	objectPosition: 'center',
	display: 'block',
});
