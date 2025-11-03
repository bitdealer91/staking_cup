"use client";
import { PropsWithChildren } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChooseTeamModal({ open, onClose }: PropsWithChildren<Props>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl leaderboard-card p-6">
        <h2 className="font-pixel text-xl mb-4">CHOOSE YOUR TEAM</h2>
        <p className="opacity-80 mb-6">Coming soon. Pick a validator team to represent.</p>
        <div className="flex justify-end">
          <button className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


