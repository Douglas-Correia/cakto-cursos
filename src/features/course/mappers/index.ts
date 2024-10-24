import { FirestoreCourseData, FirestoreLessonData } from '@/features/course/types';
import moment from 'moment';

const extractDate = (
  date:
    | {
        _seconds: number;
      }
    | null
    | undefined
): Date => (date ? moment.unix(date._seconds).toDate() : new Date());

export const mapCourseFromFirestore = (course: FirestoreCourseData) => ({
  id: course.data.externalId,
  name: course.data.nome,
  createdAt: extractDate(course.data.dataCriacao),
  cover: course.data.capa || '/default-course-cover.png',
  modules:
    course.data.modulos?.map((modulo) => ({
      id: modulo.id,
      name: modulo.nome,
      position: modulo.posicao,
      cover: modulo.capa || '/default-module-cover.png',
      createdAt: extractDate(modulo.dataCriacao),
      lessons:
        modulo.aulas?.map((aula) => ({
          id: aula.id,
          name: aula.nome,
          description: '',
          position: aula.posicao,
          createdAt: extractDate(aula.dataCriacao),
          cover: aula.capa || '/default-lesson-cover.png',
          video: '',
          files: [],
        })) || [],
    })) || [],
});

export const mapLessonFromFirestore = (lesson: FirestoreLessonData) => ({
  id: lesson?.id,
  name: lesson?.nome,
  description: lesson?.descricao || '',
  position: lesson?.posicao,
  createdAt: extractDate(lesson.dataCriacao),
  cover: lesson?.capa || '/default-lesson-cover.png',
  video: lesson?.video || '',
  files: lesson?.files,
});
