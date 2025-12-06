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

import { teacherService } from '@/services/api';
import type { Teacher, UpdateTeacherData } from '@/types';

import { ArrowLeft, Loader2, Save } from 'lucide-react';

import SuccessModal from '@/components/ui/successModal';
import ErrorModal from '@/components/ui/errorModal';

export default function EditTeacherPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [teacher, setTeacher] = useState<Teacher | null>(null);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [successOpen, setSuccessOpen] = useState(false);

  const [formData, setFormData] = useState<UpdateTeacherData>({
    salary: null,
    qualification: null,
    gender: null,
    experience: null,
  });

  useEffect(() => {
    if (id) fetchTeacher(parseInt(id));
  }, [id]);

  const fetchTeacher = async (teacherId: number) => {
    setIsLoading(true);
    try {
      const response = await teacherService.getById(teacherId);
      setTeacher(response.data);

      setFormData({
        salary: response.data.salary,
        qualification: response.data.qualification,
        gender: response.data.gender,
        experience: response.data.experience,
      });
    } catch (err) {
      setErrorMessage("Failed to load teacher data.");
      setErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);

    try {
      await teacherService.update(parseInt(id), formData);
      setSuccessOpen(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update teacher.";
      setErrorMessage(msg);
      setErrorOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateTeacherData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' || value === 'none-gender' ? null : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg font-medium">Teacher not found</p>
        <Button onClick={() => navigate('/dashboard/teachers')} className="mt-4">
          Back to Teachers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* SUCCESS MODAL */}
      <SuccessModal
        open={successOpen}
        title="Teacher Updated Successfully"
        description={`Details for ${teacher.user.name} have been updated.`}
        showButtons={true}
        okText="OK"
        cancelText="Go Back"
        onConfirm={() => setSuccessOpen(false)}
        onCancel={() => navigate('/dashboard/teachers')}
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
          onClick={() => navigate('/dashboard/teachers')}
          className="flex items-center text-blue-600 text-sm hover:underline w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Teachers
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-600">Edit Teacher</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Update teacher information for {teacher.user.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">

          {/* User Info Card (Read-only) */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl text-gray-600">User Information</CardTitle>
              <CardDescription>Basic account information (read-only)</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className='text-gray-600'>Full Name</Label>
                <Input value={teacher.user.name} disabled />
              </div>

              <div className="space-y-2">
                <Label className='text-gray-600'>Email</Label>
                <Input value={teacher.user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label className='text-gray-600'>Phone</Label>
                <Input value={teacher.user.phone} disabled />
              </div>

              <p className="text-xs text-muted-foreground">
                User account details cannot be edited here.
              </p>
            </CardContent>
          </Card>

          {/* Editable Teacher Details */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl text-gray-600">Teacher Details</CardTitle>
              <CardDescription>Update professional information</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="qualification" className="text-gray-600">Qualification</Label>
                <Input
                  id="qualification"
                  placeholder="M.Sc. Mathematics, B.Ed."
                  value={formData.qualification || ''}
                  onChange={(e) => handleChange('qualification', e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-gray-600">Experience</Label>
                <Input
                  id="experience"
                  placeholder="5 years"
                  value={formData.experience || ''}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-600">Gender</Label>
                <Select
                  value={formData.gender || 'none-gender'}
                  onValueChange={(value) => handleChange('gender', value)}
                  disabled={isSaving}
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
                <Label htmlFor="salary" className="text-gray-600">Salary (Monthly)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="50000"
                  value={formData.salary || ''}
                  onChange={(e) => handleChange('salary', parseFloat(e.target.value))}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">Enter amount in USD</p>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/teachers')}
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
