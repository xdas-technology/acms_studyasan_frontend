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
import type { Subject } from '@/types';

interface DeleteSubjectDialogProps {
  subject: Subject | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteSubjectDialog({
  subject,
  onClose,
  onConfirm,
}: DeleteSubjectDialogProps) {
  if (!subject) return null;

  const hasEnrollments = (subject._count?.enrollments || 0) > 0;
  const hasTeachers = (subject._count?.teacher_subject_junctions || 0) > 0;

  return (
    <Dialog open={!!subject} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Delete Subject</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this subject? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted p-4 rounded-md space-y-2">
          <p className="font-medium">{subject.name}</p>
          {subject.class && (
            <p className="text-sm text-muted-foreground">Class: {subject.class.name}</p>
          )}
          {subject.board && (
            <p className="text-sm text-muted-foreground">Board: {subject.board.name}</p>
          )}
          {(hasEnrollments || hasTeachers) && (
            <div className="mt-4 space-y-2">
              {hasEnrollments && (
                <p className="text-sm text-destructive">
                  Warning: {subject._count?.enrollments} student(s) enrolled
                </p>
              )}
              {hasTeachers && (
                <p className="text-sm text-destructive">
                  Warning: {subject._count?.teacher_subject_junctions} teacher(s) assigned
                </p>
              )}
            </div>
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