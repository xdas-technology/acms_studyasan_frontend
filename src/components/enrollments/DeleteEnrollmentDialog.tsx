import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { Enrollment } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface DeleteEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: Enrollment | null;
  onConfirm: () => void;
}

const DeleteEnrollmentDialog: React.FC<DeleteEnrollmentDialogProps> = ({
  open,
  onOpenChange,
  enrollment,
  onConfirm,
}) => {
  if (!enrollment) return null;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-left">Delete Enrollment</DialogTitle>
              <DialogDescription className="text-left">
                Are you sure you want to delete this enrollment? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Student</label>
              <p className="text-sm font-semibold text-gray-900">{enrollment.student.user.name}</p>
              <p className="text-xs text-gray-600">{enrollment.student.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Subject</label>
              <p className="text-sm font-semibold text-gray-900">{enrollment.subject.name}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Class: {enrollment.subject.class?.name || 'N/A'}
                </Badge>
                {enrollment.subject.is_course && (
                  <Badge variant="outline" className="text-xs">
                    Course
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Enrolled On</label>
              <p className="text-sm text-gray-900">
                {new Date(enrollment.created_on).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Enrollment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteEnrollmentDialog };