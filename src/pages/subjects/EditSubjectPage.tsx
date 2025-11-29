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
import { subjectService, boardService, classService } from '@/services/api';
import type { Board, Class, Subject, UpdateSubjectData } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react';

export default function EditSubjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [error, setError] = useState('');
  const [syllabusUnits, setSyllabusUnits] = useState<{ name: string; content: string }[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitContent, setNewUnitContent] = useState('');
  const [formData, setFormData] = useState<UpdateSubjectData>({
    name: '',
    cover_image: null,
    class_id: null,
    board_id: null,
    syllabus: null,
    is_course: false,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard/subjects');
      return;
    }
    fetchBoards();
    fetchClasses();
    if (id) {
      fetchSubject(parseInt(id));
    }
  }, [id, isAdmin, navigate]);

  const fetchSubject = async (subjectId: number) => {
    setIsLoading(true);
    try {
      const response = await subjectService.getById(subjectId);
      setSubject(response.data);
      setFormData({
        name: response.data.name,
        cover_image: response.data.cover_image,
        class_id: response.data.class_id,
        board_id: response.data.board_id,
        syllabus: response.data.syllabus,
        is_course: response.data.is_course,
      });
      
      // Populate syllabus units from existing data
      if (response.data.syllabus?.units) {
        setSyllabusUnits(response.data.syllabus.units);
      }
    } catch (error) {
      console.error('Failed to fetch subject:', error);
      setError('Failed to load subject data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await boardService.getAll({ limit: 100 });
      setBoards(response.data.data);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll({ limit: 100 });
      setClasses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const addUnit = () => {
    if (newUnitName.trim() && newUnitContent.trim()) {
      setSyllabusUnits([...syllabusUnits, { name: newUnitName.trim(), content: newUnitContent.trim() }]);
      setNewUnitName('');
      setNewUnitContent('');
    }
  };

  const removeUnit = (index: number) => {
    setSyllabusUnits(syllabusUnits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');
    setIsSaving(true);

    try {
      // Prepare syllabus data
      const syllabusData = syllabusUnits.length > 0 ? { units: syllabusUnits } : null;

      await subjectService.update(parseInt(id), {
        ...formData,
        syllabus: syllabusData,
      });
      navigate('/dashboard/subjects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update subject');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateSubjectData, value: any) => {
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

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg font-medium">Subject not found</p>
        <Button onClick={() => navigate('/dashboard/subjects')} className="mt-4">
          Back to Subjects
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
          onClick={() => navigate('/dashboard/subjects')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Subject</h1>
          <p className="text-muted-foreground mt-2">
            Update subject information for {subject.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Subject details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  placeholder="Mathematics"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_image">Cover Image URL</Label>
                <Input
                  id="cover_image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.cover_image ?? ''}
                  onChange={(e) => handleChange('cover_image', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_course">Type</Label>
                <Select
                  value={formData.is_course ? 'course' : 'subject'}
                  onValueChange={(value) => handleChange('is_course', value === 'course')}
                  disabled={isSaving}
                >
                  <SelectTrigger id="is_course">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subject">Subject</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Classification Card */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
              <CardDescription>Class and board assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={formData.class_id?.toString() || 'none'}
                  onValueChange={(value) => handleChange('class_id', value === 'none' ? null : parseInt(value))}
                  disabled={isSaving || formData.is_course}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="board">Board</Label>
                <Select
                  value={formData.board_id?.toString() || 'none'}
                  onValueChange={(value) => handleChange('board_id', value === 'none' ? null : parseInt(value))}
                  disabled={isSaving || formData.is_course}
                >
                  <SelectTrigger id="board">
                    <SelectValue placeholder="Select a board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id.toString()}>
                        {board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Syllabus Card - Full Width */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Syllabus</CardTitle>
            <CardDescription>
              Add syllabus units for this subject (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Unit */}
            <div className="space-y-3">
              <div className="grid gap-2 md:grid-cols-2">
                <Input
                  placeholder="Unit name (e.g., Algebra Basics)"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  disabled={isSaving}
                />
                <Input
                  placeholder="Unit description/content"
                  value={newUnitContent}
                  onChange={(e) => setNewUnitContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addUnit()}
                  disabled={isSaving}
                />
              </div>
              <Button
                type="button"
                onClick={addUnit}
                disabled={!newUnitName.trim() || !newUnitContent.trim() || isSaving}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </div>

            {/* Units List */}
            {syllabusUnits.length > 0 && (
              <div className="space-y-2">
                <Label>Units ({syllabusUnits.length})</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {syllabusUnits.map((unit, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-md">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{unit.name}</div>
                        <div className="text-sm text-muted-foreground">{unit.content}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUnit(index)}
                        disabled={isSaving}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {syllabusUnits.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No units added yet. Add units above to create a syllabus.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/subjects')}
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