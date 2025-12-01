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
import { studentService, boardService, classService } from '@/services/api';
import type { Student, Board, Class } from '@/types';
import { Plus, Eye, Edit, Trash2, Loader2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import DeleteStudentDialog from '@/components/students/DeleteStudentDialog';

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');

  useEffect(() => {
    fetchBoards();
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchTerm, selectedClass, selectedBoard, selectedGender]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedClass) params.class_id = parseInt(selectedClass);
      if (selectedBoard) params.board_id = parseInt(selectedBoard);
      if (selectedGender) params.gender = selectedGender;

      const response = await studentService.getAll(params);
      setStudents(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch students:', error);
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

  const handleDelete = async () => {
    if (!deleteStudent) return;

    try {
      await studentService.delete(deleteStudent.id);
      setDeleteStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
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
    setSelectedGender('');
    setCurrentPage(1);
  };

  const getGenderBadge = (gender: string | null) => {
    if (!gender) return null;
    const variants: Record<string, any> = {
      M: 'default',
      F: 'secondary',
      OTHER: 'outline',
    };
    return (
      <Badge variant={variants[gender] || 'default'}>
        {gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground mt-2">
            Manage student accounts and information
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/students/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter students by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={selectedClass} onValueChange={(value) => {
              setSelectedClass(value === "all-classes" ? "" : value);
              handleFilterChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-classes">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBoard} onValueChange={(value) => {
              setSelectedBoard(value === "all-boards" ? "" : value);
              handleFilterChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Boards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-boards">All Boards</SelectItem>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id.toString()}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedGender} onValueChange={(value) => {
              setSelectedGender(value === "all-genders" ? "" : value);
              handleFilterChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-genders">All Genders</SelectItem>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(searchTerm || selectedClass || selectedBoard || selectedGender) && (
            <div className="mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({total})</CardTitle>
          <CardDescription>
            A list of all students in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Users className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No students found</p>
              <p className="text-sm">Try adjusting your filters or add a new student</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Board</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.user.name}
                        </TableCell>
                        <TableCell>{student.user.email}</TableCell>
                        <TableCell>{student.user.phone}</TableCell>
                        <TableCell>
                          {student.class ? (
                            <Badge variant="outline">{student.class.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.board ? (
                            <Badge variant="outline">{student.board.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getGenderBadge(student.gender)}</TableCell>
                        <TableCell>
                          {student.school || (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge>{student._count?.enrollments || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/dashboard/students/${student.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/dashboard/students/${student.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteStudent(student)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                  {Math.min(currentPage * limit, total)} of {total} students
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
      <DeleteStudentDialog
        student={deleteStudent}
        onClose={() => setDeleteStudent(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}