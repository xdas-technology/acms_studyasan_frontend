import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { subjectService, boardService, classService, teacherService, studentService } from '@/services/api';
import type { Subject, Board, Class } from '@/types';
import { Plus, Search, Eye, Edit, Trash2, Loader2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import DeleteSubjectDialog from '@/components/subjects/DeleteSubjectDialog';
import { useAuthStore } from '@/store/authStore';

export default function SubjectsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);
  const [currentTeacherId, setCurrentTeacherId] = useState<number | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    fetchBoards();
    fetchClasses();
    fetchCurrentTeacher();
    fetchCurrentStudent();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [currentPage, searchTerm, selectedClass, selectedBoard, selectedType, currentTeacherId, currentStudentId]);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedClass) params.class_id = parseInt(selectedClass);
      if (selectedBoard) params.board_id = parseInt(selectedBoard);
      if (selectedType) params.is_course = selectedType === 'course';

      // If user is a teacher, only show subjects assigned to them
      if (user?.role === 'TEACHER' && user?.id) {
        params.user_id = user.id;
        params.role = user.role;
      }

      // If user is a student, only show subjects they're enrolled in
      if (user?.role === 'STUDENT' && user?.id) {
        params.user_id = user.id;
        params.role = user.role;
      }

      const response = await subjectService.getAll(params);
      setSubjects(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
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

  const fetchCurrentTeacher = async () => {
    if (!user || user.role !== 'TEACHER') return;
    
    try {
      // We need to find the teacher profile for the current user
      // Since we don't have a direct endpoint, we'll search teachers by user email
      const response = await teacherService.getAll({ 
        search: user.email,
        limit: 1 
      });
      
      if (response.data.data.length > 0) {
        setCurrentTeacherId(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch current teacher:', error);
    }
  };

  const fetchCurrentStudent = async () => {
    if (!user || user.role !== 'STUDENT') return;
    
    try {
      // We need to find the student profile for the current user
      // Since we don't have a direct endpoint, we'll search students by user email
      const response = await studentService.getAll({ 
        search: user.email,
        limit: 1 
      });
      
      if (response.data.data.length > 0) {
        setCurrentStudentId(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch current student:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteSubject) return;

    try {
      await subjectService.delete(deleteSubject.id);
      setDeleteSubject(null);
      fetchSubjects();
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedBoard('');
    setSelectedType('');
    setCurrentPage(1);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground mt-2">
            Manage subjects and courses
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/dashboard/subjects/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter subjects by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={selectedClass} onValueChange={(value) => {
              setSelectedClass(value);
              handleFilterChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBoard} onValueChange={(value) => {
              setSelectedBoard(value);
              handleFilterChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Boards</SelectItem>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id.toString()}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={(value) => {
              setSelectedType(value);
              handleFilterChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
                <SelectItem value="course">Course</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subjects ({total})</CardTitle>
          <CardDescription>
            A list of all subjects in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No subjects found</p>
              <p className="text-sm">Try adjusting your filters or add a new subject</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Board</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Teachers</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>{subject.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {subject.class ? (
                            <Badge variant="outline">{subject.class.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {subject.board ? (
                            <Badge variant="outline">{subject.board.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={subject.is_course ? 'default' : 'secondary'}>
                            {subject.is_course ? 'Course' : 'Subject'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{subject._count?.teacher_subject_junctions || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{subject._count?.enrollments || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/dashboard/subjects/${subject.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/dashboard/subjects/${subject.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteSubject(subject)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * limit + 1} to{' '}
                  {Math.min(currentPage * limit, total)} of {total} subjects
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {isAdmin && (
        <DeleteSubjectDialog
          subject={deleteSubject}
          onClose={() => setDeleteSubject(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}