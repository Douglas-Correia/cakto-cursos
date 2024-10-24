export type FirestoreCourseData = {
  data: {
    externalId: string;
    nome: string;
    capa: string;
    userId: number;
    dataCriacao: {
      _seconds: number;
      _nanoseconds: number;
    };
    modulos: Array<{
      capa: string;
      posicao: number;
      aulas: Array<{
        capa: string;
        posicao: number;
        nome: string;
        id: string;
        video: string;
        descricao: string;
        dataCriacao: {
          _seconds: number;
          _nanoseconds: number;
        };
        files: string[];
      }>;
      nome: string;
      id: string;
      dataCriacao: {
        _seconds: number;
        _nanoseconds: number;
      };
    }>;
  };
};

export type FirestoreLessonData = {
  id: string;
  capa: string;
  posicao: number;
  files: string[];
  nome: string;
  moduloId: string;
  cursoId: string;
  video: string;
  dataCriacao: {
    _seconds: number;
    _nanoseconds: number;
  };
  descricao: string;
};

export type Enrollment = {
  courseId: string;
  subscribedAt: Date;
  completedLessons: Array<{
    id: string;
    rating?: number;
    completedAt: Date;
  }>;
};

export type Lesson = {
  id: string;
  name: string;
  description: string;
  position: number;
  createdAt: Date;
  cover: string;
  video: string;
  completed?: boolean;
  files?: string[];
  error?: string;
  releaseDate?: string;
};

export type LessonEnrollment = Lesson & {
  completed: boolean;
  completedAt?: Date;
  rating?: number;
};

export type Module = {
  id: string;
  name: string;
  cover: string;
  position: number;
  createdAt: Date;
  lessons: Array<Lesson>;
};

export type ModuleEnrollment = Omit<Module, 'lessons'> & {
  progress: number;
  lessons: Array<LessonEnrollment>;
};

export type Course = {
  id: string;
  name: string;
  createdAt: Date;
  cover: string;
  modules: Array<Module>;
};

export type CourseEnrollment = Omit<Course, 'modules'> & {
  subscription: Enrollment;
  progress: number;
  modules: Array<ModuleEnrollment>;
};

export type CompleteLessonPayload = {
  courseId: string;
  lessonId: string;
  rating?: number;
};

export enum PlayerType {
  CAKTO = 'CAKTO',
  YOUTUBE = 'YOUTUBE',
  PANDA = 'PANDA',
}
