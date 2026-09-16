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

// A type alias (not an interface) so this gets an implicit index signature and can be passed straight to
// Motion as an `initial`/`animate` target.
export type Rect = {
	height: number;
	left: number;
	top: number;
	width: number;
};

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

/**
 * Numeric slot geometry for the given clip width. Mirrors `staticGeometryOf` (same constants) so the
 * measured client geometry matches the server-rendered `calc()` geometry.
 *
 * Motion needs numbers to tween between slots; when an element has no numeric origin registered it reads
 * one from the DOM, which is already the destination by the time the animation starts. Deriving the rect
 * from the clip width gives every element a numeric origin up front.
 */
export function pixelGeometryOf(slot: Slot, clipWidth: number): Rect {
	if (slot.kind === 'big') {
		return { height: CLIP_HEIGHT, left: 0, top: 0, width: clipWidth - THUMB_WIDTH - SIDE_GAP };
	}

	const left = clipWidth - THUMB_WIDTH;

	if (slot.kind === 'thumb') {
		return { height: THUMB_HEIGHT, left, top: slot.pos * THUMB_STEP, width: THUMB_WIDTH };
	}

	return { height: THUMB_HEIGHT, left, top: -(slot.pos + 1) * THUMB_STEP, width: THUMB_WIDTH };
}
