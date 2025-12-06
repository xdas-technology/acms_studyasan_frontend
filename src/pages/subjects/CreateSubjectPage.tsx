import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type { Board, Class, CreateSubjectData } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react';

export default function CreateSubjectPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [error, setError] = useState('');
  const [syllabusUnits, setSyllabusUnits] = useState<{ name: string; content: string }[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitContent, setNewUnitContent] = useState('');
  const [formData, setFormData] = useState<CreateSubjectData>({
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
  }, [isAdmin, navigate]);

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
    setError('');
    setIsLoading(true);

    try {
      // Prepare syllabus data
      const syllabusData = syllabusUnits.length > 0 ? { units: syllabusUnits } : null;

      await subjectService.create({
        ...formData,
        syllabus: syllabusData,
      });
      navigate('/dashboard/subjects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateSubjectData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? null : value,
    }));
  };

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
          <p>Back to subjects</p>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Subject</h1>
          <p className="text-muted-foreground mt-2">
            Create a new subject or course
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_course">Type</Label>
                <Select
                  value={formData.is_course ? 'course' : 'subject'}
                  onValueChange={(value) => handleChange('is_course', value === 'course')}
                  disabled={isLoading}
                >
                  <SelectTrigger id="is_course">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subject">Subject</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Courses are standalone, subjects require class/board
                </p>
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
                  disabled={isLoading || formData.is_course}
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
                {formData.is_course && (
                  <p className="text-xs text-muted-foreground">
                    Class not required for courses
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="board">Board</Label>
                <Select
                  value={formData.board_id?.toString() || 'none'}
                  onValueChange={(value) => handleChange('board_id', value === 'none' ? null : parseInt(value))}
                  disabled={isLoading || formData.is_course}
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
                {formData.is_course && (
                  <p className="text-xs text-muted-foreground">
                    Board not required for courses
                  </p>
                )}
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
                  disabled={isLoading}
                />
                <Input
                  placeholder="Unit description/content"
                  value={newUnitContent}
                  onChange={(e) => setNewUnitContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addUnit()}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                onClick={addUnit}
                disabled={!newUnitName.trim() || !newUnitContent.trim() || isLoading}
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
                        disabled={isLoading}
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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Subject
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}