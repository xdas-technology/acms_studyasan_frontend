import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
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
  if (!student) return null;

  return (
    <Dialog open={!!student} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Delete Student</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this student? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted p-4 rounded-md">
          <p className="font-medium">{student.user.name}</p>
          <p className="text-sm text-muted-foreground">{student.user.email}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}