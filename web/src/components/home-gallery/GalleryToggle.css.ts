import { globalStyle, style } from '@vanilla-extract/css';

export const icon = style({
	display: 'inline-flex',
});

globalStyle(`${icon} svg`, {
	display: 'block',
	height: 24,
	width: 24,
});
