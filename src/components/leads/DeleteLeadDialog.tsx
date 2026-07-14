import { ConfirmDialog } from '../ui/ConfirmDialog';

interface DeleteLeadDialogProps {
  leadName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}

export function DeleteLeadDialog({ leadName, onConfirm, onCancel, deleting }: DeleteLeadDialogProps) {
  return (
    <ConfirmDialog
      title="מחיקת ליד"
      message={`האם אתה בטוח שברצונך למחוק את הליד "${leadName}"? פעולה זו אינה הפיכה.`}
      confirmLabel="כן, מחק"
      loading={deleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
