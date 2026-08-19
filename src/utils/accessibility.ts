import type { TextScale } from '../types';

export const ROOT_FONT_SIZE_PX: Record<TextScale, number> = {
  normal: 16,
  large: 17.5,
  xlarge: 19,
};

export function applyTextScale(root: Pick<HTMLElement, 'style' | 'dataset'>, scale: TextScale): void {
  root.style.fontSize = `${ROOT_FONT_SIZE_PX[scale]}px`;
  root.dataset.textScale = scale;
}
