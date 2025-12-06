import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { studentService, boardService, classService } from '@/services/api';
import type { Board, Class, Student, UpdateStudentData } from '@/types';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

import SuccessModal from '@/components/ui/successModal';
import ErrorModal from '@/components/ui/errorModal';

export default function EditStudentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [student, setStudent] = useState<Student | null>(null);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [successOpen, setSuccessOpen] = useState(false);

  const [formData, setFormData] = useState<UpdateStudentData>({
    class_id: null,
    board_id: null,
    date_of_birth: null,
    gender: null,
    school: null,
  });

  useEffect(() => {
    fetchBoards();
    fetchClasses();
    if (id) {
      fetchStudent(parseInt(id));
    }
  }, [id]);

  const fetchStudent = async (studentId: number) => {
    setIsLoading(true);
    try {
      const response = await studentService.getById(studentId);
      setStudent(response.data);

      setFormData({
        class_id: response.data.class_id,
        board_id: response.data.board_id,
        date_of_birth: response.data.date_of_birth,
        gender: response.data.gender,
        school: response.data.school,
      });
    } catch (error) {
      setErrorMessage("Failed to load student data.");
      setErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await boardService.getAll({ limit: 100 });
      setBoards(response.data.data);
    } catch {
      setErrorMessage("Failed to load boards.");
      setErrorOpen(true);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll({ limit: 100 });
      setClasses(response.data.data);
    } catch {
      setErrorMessage("Failed to load classes.");
      setErrorOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);

    try {
      await studentService.update(parseInt(id), formData);
      setSuccessOpen(true); // show success modal
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update student.';
      setErrorMessage(msg);
      setErrorOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateStudentData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? null : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg font-medium">Student not found</p>
        <Button onClick={() => navigate('/dashboard/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* SUCCESS MODAL */}
      <SuccessModal
        open={successOpen}
        title="Student Updated Successfully"
        description={`Details for ${student.user.name} have been updated.`}
        showButtons={true}
        okText="OK"
        cancelText="Go Back"
        onConfirm={() => setSuccessOpen(false)} // stay on page
        onCancel={() => navigate('/dashboard/students')} // return to Students list
        onClose={() => setSuccessOpen(false)}
      />

      {/* ERROR MODAL */}
      <ErrorModal
        open={errorOpen}
        title="Error"
        description={errorMessage}
        okText="Close"
        showButtons={true}
        onConfirm={() => setErrorOpen(false)}
        onClose={() => setErrorOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => navigate('/dashboard/students')}
          className="flex items-center text-blue-600 text-sm hover:underline w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Students
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-600">Edit Student</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Update student details for {student.user.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">

          {/* User Information Card (read-only) */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl text-gray-600">User Information</CardTitle>
              <CardDescription>Account information (read-only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className='text-gray-600'>Full Name</Label>
                <Input value={student.user.name} disabled />
              </div>
              <div className="space-y-2">
                <Label className='text-gray-600'>Email</Label>
                <Input value={student.user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label className='text-gray-600'>Phone</Label>
                <Input value={student.user.phone} disabled />
              </div>
              <p className="text-xs text-muted-foreground">User account details cannot be edited here.</p>
            </CardContent>
          </Card>

          {/* Editable Student Info */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl text-gray-600">Student Details</CardTitle>
              <CardDescription>Update student information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="class" className='text-gray-600'>Class</Label>
                <Select
                  value={formData.class_id?.toString() || 'none-class'}
                  onValueChange={(value) =>
                    handleChange('class_id', value === 'none-class' ? null : parseInt(value))
                  }
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none-class">None</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="board" className='text-gray-600'>Board</Label>
                <Select
                  value={formData.board_id?.toString() || 'none-board'}
                  onValueChange={(value) =>
                    handleChange('board_id', value === 'none-board' ? null : parseInt(value))
                  }
                >
                  <SelectTrigger id="board">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none-board">None</SelectItem>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id.toString()}>
                        {board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className='text-gray-600'>Gender</Label>
                <Select
                  value={formData.gender || 'none-gender'}
                  onValueChange={(value) =>
                    handleChange('gender', value === 'none-gender' ? null : value)
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none-gender">None</SelectItem>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className='text-gray-600'>Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school" className='text-gray-600'>School</Label>
                <Input
                  id="school"
                  placeholder="ABC High School"
                  value={formData.school || ''}
                  onChange={(e) => handleChange('school', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/students')}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
