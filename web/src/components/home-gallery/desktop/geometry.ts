export const THUMB_WIDTH = 260;
export const THUMB_HEIGHT = 186;
export const THUMB_STEP = 210;
export const CLIP_HEIGHT = 606;
export const SIDE_GAP = 60;

export interface CssGeometry {
	height: number;
	left: number | string;
	top: number;
	width: number | string;
}

export interface Rect {
	height: number;
	left: number;
	top: number;
	width: number;
}

export type Slot = { kind: 'big' } | { kind: 'stack'; pos: number } | { kind: 'thumb'; pos: number };

export function staticGeometryOf(slot: Slot): CssGeometry {
	if (slot.kind === 'big') {
		return { height: CLIP_HEIGHT, left: 0, top: 0, width: `calc(100% - ${THUMB_WIDTH}px - ${SIDE_GAP}px)` };
	}

	const left = `calc(100% - ${THUMB_WIDTH}px)`;

	if (slot.kind === 'thumb') {
		return { height: THUMB_HEIGHT, left, top: slot.pos * THUMB_STEP, width: THUMB_WIDTH };
	}

	return { height: THUMB_HEIGHT, left, top: -(slot.pos + 1) * THUMB_STEP, width: THUMB_WIDTH };
}

export function toRect(origin: DOMRect, r?: DOMRect): Rect {
	const o = origin;

	if (!r) return { height: 0, left: 0, top: 0, width: 0 };

	return { height: r.height, left: r.left - o.left, top: r.top - o.top, width: r.width };
}
