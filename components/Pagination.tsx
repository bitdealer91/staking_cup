"use client";
import { clsx } from 'clsx';

type Props = {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({ page, pageCount, onPrev, onNext }: Props) {
  // Arrows disabled per latest request; keep layout clean by rendering nothing
  return null;
}


