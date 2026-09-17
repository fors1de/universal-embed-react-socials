import type { Frame } from '../types';

export type { Frame };

export const useFrame = (frame?: Frame): Frame => frame ?? {};
