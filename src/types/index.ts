export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
  title: string;
  description: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any;
}


export interface Student {
  id: number;
  user_id: number;
  class_id: number | null;
  board_id: number | null;
  date_of_birth: string | null;
  gender: 'M' | 'F' | 'OTHER' | null;
  school: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  class: {
    id: number;
    name: string;
  } | null;
  board: {
    id: number;
    name: string;
  } | null;
  _count?: {
    enrollments: number;
  };
}

export interface Board {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBoardData {
  name: string;
}

export interface UpdateBoardData {
  name: string;
}

export interface CreateClassData {
  name: string;
}

export interface UpdateClassData {
  name: string;
}

export interface CreateStudentData {
  name: string;
  email: string;
  phone: string;
  password: string;
  class_id: number | null;
  board_id: number | null;
  date_of_birth: string | null;
  gender: 'M' | 'F' | 'OTHER' | null;
  school: string | null;
}

export interface UpdateStudentData {
  class_id?: number | null;
  board_id?: number | null;
  date_of_birth?: string | null;
  gender?: 'M' | 'F' | 'OTHER' | null;
  school?: string | null;
}

export interface Teacher {
  id: number;
  user_id: number;
  salary: number | null;
  qualification: string | null;
  gender: 'M' | 'F' | 'OTHER' | null;
  experience: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  _count?: {
    teacher_subject_junctions: number;
  };
  teacher_subject_junctions?: {
    id: number;
    subject_id: number;
    subject: {
      id: number;
      name: string;
      class: {
        id: number;
        name: string;
      } | null;
    };
  }[];
}

export interface Subject {
  id: number;
  name: string;
  cover_image: string | null;
  class_id: number | null;
  board_id: number | null;
  syllabus: any;
  is_course: boolean;
  created_at: string;
  updated_at: string;
  class: {
    id: number;
    name: string;
  } | null;
  board: {
    id: number;
    name: string;
  } | null;
  _count?: {
    enrollments: number;
    teacher_subject_junctions: number;
  };
  enrollments?: {
    id: number;
    student: {
      id: number;
      user: {
        id: number;
        name: string;
        email: string;
      };
    };
  }[];
  teacher_subject_junctions?: {
    id: number;
    teacher: {
      id: number;
      user: {
        id: number;
        name: string;
        email: string;
      };
    };
  }[];
}

export interface CreateSubjectData {
  name: string;
  cover_image: string | null;
  class_id: number | null;
  board_id: number | null;
  syllabus: any;
  is_course: boolean;
}

export interface UpdateSubjectData {
  name?: string;
  cover_image?: string | null;
  class_id?: number | null;
  board_id?: number | null;
  syllabus?: any;
  is_course?: boolean;
}

export interface CreateTeacherData {
  name: string;
  email: string;
  phone: string;
  password: string;
  salary: number | null;
  qualification: string | null;
  gender: 'M' | 'F' | 'OTHER' | null;
  experience: string | null;
}

export interface UpdateTeacherData {
  salary?: number | null;
  qualification?: string | null;
  gender?: 'M' | 'F' | 'OTHER' | null;
  experience?: string | null;
}

export interface TeacherSubjectAssignment {
  teacher_id: number;
  subject_id: number;
}

export interface Enrollment {
  id: number;
  student_id: number;
  subject_id: number;
  created_on: string;
  updated_on: string;
  student: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
    class: {
      id: number;
      name: string;
    } | null;
    board: {
      id: number;
      name: string;
    } | null;
  };
  subject: {
    id: number;
    name: string;
    is_course: boolean;
    class: {
      id: number;
      name: string;
    } | null;
    board: {
      id: number;
      name: string;
    } | null;
  };
}

export interface CreateEnrollmentData {
  student_id: number;
  subject_id: number;
}

export interface BulkEnrollmentData {
  student_ids: number[];
  subject_id: number;
}