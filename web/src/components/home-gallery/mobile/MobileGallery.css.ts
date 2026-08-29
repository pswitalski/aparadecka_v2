import { style } from '@vanilla-extract/css';

export const carousel = style({
	'@media': {
		'(min-width: 768px)': {
			display: 'none',
		},
	},
	backgroundColor: 'var(--color-surface)',
	display: 'flex',
	flexDirection: 'column',
	height: 'calc(100dvh - var(--header-height-mobile) - var(--space-4))',
	marginBottom: 'calc(-1 * var(--space-4))',
	marginInline: 'calc(-1 * var(--space-4))',
	overflow: 'hidden',
	/* Full-bleed inside `main` (padding var(--space-4)) and fill the viewport below the
	   mobile header down to the bottom edge (margin-bottom cancels main's bottom padding). */
	width: 'calc(100% + 2 * var(--space-4))',
});

export const dotsBar = style({
	alignItems: 'center',
	backgroundColor: 'var(--color-bg)',
	display: 'flex',
	flex: '0 0 auto',
	justifyContent: 'center',
	minHeight: 'var(--space-6)',
	padding: '0 var(--space-4)',
});

export const dots = style({
	display: 'flex',
	gap: 'var(--space-2)',
});

export const dot = style({
	backgroundColor: '#D9D9D9',
	border: 0,
	borderRadius: 0,
	cursor: 'pointer',
	height: 9,
	padding: 0,
	transition: 'background-color 200ms ease',
	width: 9,
});

export const dotActive = style({
	backgroundColor: '#BEACAC',
});

export const title = style({
	backgroundColor: 'var(--color-surface)',
	color: 'var(--color-text)',
	flex: '0 0 auto',
	fontFamily: 'var(--font-body)',
	fontSize: 'var(--font-size-lg)',
	lineHeight: '100%',
	padding: 'var(--space-3) var(--space-4)',
	textAlign: 'center',
	textWrap: 'balance',
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
	height: '100%',
	minWidth: 0,
	overflow: 'hidden',
});

export const img = style({
	display: 'block',
	height: '100%',
	objectFit: 'cover',
	objectPosition: 'center',
	width: '100%',
});
