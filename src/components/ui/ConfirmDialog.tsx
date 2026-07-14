import type { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="mb-6 text-sm text-gray-600">{message}</p>
      <div className="flex gap-3">
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'מוחק...' : confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          ביטול
        </Button>
      </div>
    </Modal>
  );
}
