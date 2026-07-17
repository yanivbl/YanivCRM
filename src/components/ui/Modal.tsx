import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  // 'md' for forms with a multi-column row (e.g. date + time + duration) —
  // max-w-sm crams those into overlapping fields instead of a readable row.
  size?: 'sm' | 'md';
}

const SIZE_STYLES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
};

export function Modal({ title, children, onClose, size = 'sm' }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`relative w-full ${SIZE_STYLES[size]} rounded-2xl bg-white p-6 shadow-lg`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="סגור"
          className="absolute end-6 top-6 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}
