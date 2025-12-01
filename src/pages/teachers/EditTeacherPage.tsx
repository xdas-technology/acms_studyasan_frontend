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

export default function EditTeacherPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    salary: number | null;
    qualification: string | null;
    gender: 'M' | 'F' | 'OTHER' | null;
    experience: string | null;
  }>({
    salary: null,
    qualification: null,
    gender: null,
    experience: null,
  });

  useEffect(() => {
    if (id) {
      fetchTeacher(parseInt(id));
    }
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
    } catch (error) {
      console.error('Failed to fetch teacher:', error);
      setError('Failed to load teacher data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');
    setIsSaving(true);

    try {
      await teacherService.update(parseInt(id), formData);
      navigate('/dashboard/teachers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update teacher');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateTeacherData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === 'none-gender' ? null : value === '' ? null : value,
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
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/teachers')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Teacher</h1>
          <p className="text-muted-foreground mt-2">
            Update teacher information for {teacher.user.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Information Card (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Account information (read-only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={teacher.user.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={teacher.user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={teacher.user.phone} disabled />
              </div>
              <p className="text-xs text-muted-foreground">
                User account details cannot be edited here
              </p>
            </CardContent>
          </Card>

          {/* Teacher Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Teacher Details</CardTitle>
              <CardDescription>Update professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  placeholder="M.Sc. Mathematics, B.Ed."
                  value={formData.qualification || ''}
                  onChange={(e) => handleChange('qualification', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  placeholder="5 years"
                  value={formData.experience || ''}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
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
                <Label htmlFor="salary">Salary (Monthly)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="50000"
                  value={formData.salary || ''}
                  onChange={(e) => handleChange('salary', parseFloat(e.target.value))}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  Enter amount in USD
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/teachers')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
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