import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Student } from '@/types';

interface DeleteStudentDialogProps {
  student: Student | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteStudentDialog({
  student,
  onClose,
  onConfirm,
}: DeleteStudentDialogProps) {
  return (
    <Dialog open={!!student} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Student</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{student?.user.name}</strong>?
            This action cannot be undone and will permanently remove the student
            account and all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Delete Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}