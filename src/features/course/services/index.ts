import { mapUserFromFirestore } from '@/features/auth/mappers';
import { User } from '@/features/auth/types';
import { AuthenticatedHttp } from '@/features/common/http/axios';
import { mapCourseFromFirestore, mapLessonFromFirestore } from '@/features/course/mappers';
import {
  CompleteLessonPayload,
  Course,
  FirestoreCourseData,
  Lesson,
} from '@/features/course/types';
import { downloadFile } from '@/features/utils';

export const getCourse = async (id: string): Promise<Course> =>
  AuthenticatedHttp.get<FirestoreCourseData>(`/cursos/${id}/`)
    .then(({ data }) => mapCourseFromFirestore(data))
    .catch((error) => {
      throw new Error(error.response.data || 'Ocorreu um erro ao carregar o curso');
    });

export const getVideoUrl = (lesson: Lesson): Promise<string> =>
  AuthenticatedHttp.post<string>('/aulas/getVideo/', {
    path: `/${lesson.video}`,
  }).then(({ data }) => data);

export const completeLesson = async ({
  courseId,
  lessonId,
  rating,
}: CompleteLessonPayload): Promise<User> =>
  AuthenticatedHttp.post('/usuarios/avaliar/', {
    cursoId: courseId,
    aulaId: lessonId,
    nota: rating,
  }).then((response) => mapUserFromFirestore(response.data));

export const downloadLessonFile = async (lessonId: string, fileKey: string): Promise<unknown> => {
  const encodedFileKey = encodeURIComponent(fileKey);
  return AuthenticatedHttp.get(`/aulas/getFileUrl/${lessonId}?fileKey=${encodedFileKey}`).then(
    (response) => {
      downloadFile({
        url: response.data.url,
        filename: fileKey.replace(/^.*?-/, ''),
      });
    }
  );
};

export const getLesson = async (lessonId: string): Promise<any> =>
  AuthenticatedHttp.get(`/aulas/${lessonId}/assistir`)
    .then(({ data }) => mapLessonFromFirestore(data))
    .catch((error) => ({ ...mapLessonFromFirestore(error.response.data), ...error.response.data }));
