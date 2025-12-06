import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import type { Board, Class, CreateStudentData } from '@/types';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

import SuccessModal from '@/components/ui/successModal';
import ErrorModal from '@/components/ui/errorModal';

export default function CreateStudentPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [error, setError] = useState('');

  const [successOpen, setSuccessOpen] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<CreateStudentData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    class_id: null,
    board_id: null,
    date_of_birth: null,
    gender: null,
    school: null,
  });

  useEffect(() => {
    fetchBoards();
    fetchClasses();
  }, []);

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
    setError('');
    setIsLoading(true);

    try {
      await studentService.create(formData);
      setSuccessOpen(true); // show success modal
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create student.";
      setErrorMessage(msg);
      setErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateStudentData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? null : value,
    }));
  };

  return (
    <div className="space-y-6">

      {/* SUCCESS MODAL */}
      <SuccessModal
        open={successOpen}
        title="Student Created Successfully"
        description={`${formData.name} has been added successfully.`}
        showButtons={true}
        okText="OK"
        cancelText="Go Back"
        onConfirm={() => setSuccessOpen(false)} // OK button: stay on page
        onCancel={() => navigate('/dashboard/students')} // Go Back button
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
        <Link
          to="/dashboard/students"
          className="flex items-center text-blue-600 text-sm hover:underline w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Students
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-600">Add New Student</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a new student account with details
          </p>
        </div>
      </div>

      {/* Info */}
      <p className="text-sm text-gray-500">All fields required.</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">

          {/* User Information */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className='sm:text-xl text-xl text-gray-600'>User Information</CardTitle>
              <CardDescription>Basic account information</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-600">
                  Full Name <span className="text-saVividOrange">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600">
                  Email <span className="text-saVividOrange">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-600">
                  Phone <span className="text-saVividOrange">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1234567890"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-600">
                  Password <span className="text-saVividOrange">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>
            </CardContent>
          </Card>

          {/* Student Details */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className='sm:text-xl text-xl text-gray-600'>Student Details</CardTitle>
              <CardDescription>Additional student information</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class" className="text-gray-600">Class</Label>
                <Select
                  value={formData.class_id?.toString() || ''}
                  onValueChange={(value) => handleChange('class_id', parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="board" className="text-gray-600">Board</Label>
                <Select
                  value={formData.board_id?.toString() || ''}
                  onValueChange={(value) => handleChange('board_id', parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="board">
                    <SelectValue placeholder="Select a board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id.toString()}>
                        {board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-600">Gender</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleChange('gender', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-gray-600">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school" className="text-gray-600">School</Label>
                <Input
                  id="school"
                  placeholder="ABC High School"
                  value={formData.school || ''}
                  onChange={(e) => handleChange('school', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/students')}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Student
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
