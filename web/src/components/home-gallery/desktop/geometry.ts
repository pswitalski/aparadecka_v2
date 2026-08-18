export const THUMB_WIDTH = 260;
export const THUMB_HEIGHT = 186;
export const THUMB_STEP = 210;
export const CLIP_HEIGHT = 606;
export const SIDE_GAP = 60;

export interface Rect {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface CssGeometry {
	left: number | string;
	top: number;
	width: number | string;
	height: number;
}

export type Slot = { kind: 'big' } | { kind: 'stack'; pos: number } | { kind: 'thumb'; pos: number };

export function staticGeometryOf(slot: Slot): CssGeometry {
	if (slot.kind === 'big') {
		return { left: 0, top: 0, width: `calc(100% - ${THUMB_WIDTH}px - ${SIDE_GAP}px)`, height: CLIP_HEIGHT };
	}

	const left = `calc(100% - ${THUMB_WIDTH}px)`;

	if (slot.kind === 'thumb') {
		return { left, top: slot.pos * THUMB_STEP, width: THUMB_WIDTH, height: THUMB_HEIGHT };
	}

	return { left, top: -(slot.pos + 1) * THUMB_STEP, width: THUMB_WIDTH, height: THUMB_HEIGHT };
}

export function toRect(origin: DOMRect, r?: DOMRect): Rect {
	const o = origin;

	if (!r) return { left: 0, top: 0, width: 0, height: 0 };

	return { left: r.left - o.left, top: r.top - o.top, width: r.width, height: r.height };
}
