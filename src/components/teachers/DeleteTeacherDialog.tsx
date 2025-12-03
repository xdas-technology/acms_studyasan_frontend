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
import type { Teacher } from '@/types';

interface DeleteTeacherDialogProps {
  teacher: Teacher | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTeacherDialog({
  teacher,
  onClose,
  onConfirm,
}: DeleteTeacherDialogProps) {
  if (!teacher) return null;

  return (
    <Dialog open={!!teacher} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Delete Teacher</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this teacher? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted p-4 rounded-md">
          <p className="font-medium">{teacher.user.name}</p>
          <p className="text-sm text-muted-foreground">{teacher.user.email}</p>
          {teacher._count && teacher._count.teacher_subject_junctions > 0 && (
            <p className="text-sm text-destructive mt-2">
              Warning: This teacher is assigned to {teacher._count.teacher_subject_junctions} subject(s)
            </p>
          )}
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