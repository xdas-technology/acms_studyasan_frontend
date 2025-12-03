import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teacherService, subjectService } from '@/services/api';
import type { Subject } from '@/types';
import { Loader2 } from 'lucide-react';

interface AssignSubjectDialogProps {
  teacherId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignSubjectDialog({
  teacherId,
  isOpen,
  onClose,
  onSuccess,
}: AssignSubjectDialogProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await subjectService.getAll({ limit: 100 });
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await teacherService.assignSubject({
        teacher_id: teacherId,
        subject_id: parseInt(selectedSubject),
      });
      setSelectedSubject('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign subject');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedSubject('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Subject</DialogTitle>
          <DialogDescription>
            Assign a subject to this teacher
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={isSaving}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                      {subject.class && ` (${subject.class.name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Subject'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}