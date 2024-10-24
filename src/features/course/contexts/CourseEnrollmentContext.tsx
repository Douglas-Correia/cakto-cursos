import { useAuth } from '@/features/auth/contexts/AuthContext';
import { getCourse, downloadLessonFile } from '@/features/course/services';
import { Course, CourseEnrollment, Lesson } from '@/features/course/types';
import { LockIcon } from '@chakra-ui/icons';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Stack } from '@chakra-ui/react';
import { UseQueryResult, useQuery, useMutation } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';

type DownloadLessonFile = {
  lessonId: string;
  fileKey: string;
};

type CourseEnrollmentContextType = {
  course: CourseEnrollment | null;
  mutateDownloadLessonFile: (data: DownloadLessonFile) => void;
  isLoadingMutateDownloadLessonFile: boolean;
} & Omit<UseQueryResult<Course, unknown>, 'data'>;

const CourseEnrollmentContext = createContext<CourseEnrollmentContextType>(
  {} as CourseEnrollmentContextType
);

const CourseEnrollmentProvider: React.FC = () => {
  const { user } = useAuth();

  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      return getCourse(id as string);
    },
    enabled: !!id,
  });

  const course = useMemo(() => {
    if (!query.data) {
      return null;
    }

    const subscription = user?.subscriptions.find((subscription) => subscription.courseId === id);

    if (!subscription) {
      return null;
    }

    const sort = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

    const getCompletion = (lesson: Lesson) =>
      subscription?.completedLessons.find((completedLesson) => completedLesson.id === lesson.id);

    const modules = query.data.modules.sort(sort).map((module) => {
      const lessons = module.lessons.sort(sort).map((lesson) => {
        const completion = getCompletion(lesson);

        return {
          ...lesson,
          completed: true,
          ...(completion || {
            completed: false,
          }),
        };
      });

      const progress = Math.round(
        (lessons.filter((lesson) => lesson.completed).length / (lessons.length || 1)) * 100
      );

      return {
        ...module,
        lessons,
        progress,
      };
    });

    const lessons = query.data.modules.flatMap((module) => module.lessons) || [];

    const total = lessons.length;

    const completed = lessons.filter((lesson) => lesson.completed).length;

    const progress = Math.round((completed / total) * 100) || 0;

    return {
      ...query.data,
      subscription,
      modules,
      progress,
    };
  }, [id, query.data, user?.subscriptions]);

  const { mutateAsync: mutateDownloadLessonFile, isPending: isLoadingMutateDownloadLessonFile } =
    useMutation({
      mutationFn: ({ lessonId, fileKey }: DownloadLessonFile) =>
        downloadLessonFile(lessonId, fileKey),
    });

  return (
    <CourseEnrollmentContext.Provider
      value={{ course, mutateDownloadLessonFile, isLoadingMutateDownloadLessonFile, ...query }}
    >
      {query.isError ? (
        <Box p={3}>
          <Alert status="error" rounded="md" variant="left-accent">
            <AlertIcon as={LockIcon} color="red.300" />
            <Stack gap={0}>
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{query.error.message}</AlertDescription>
            </Stack>
          </Alert>
        </Box>
      ) : (
        <Outlet />
      )}
    </CourseEnrollmentContext.Provider>
  );
};

const useCourseEnrollment = () => {
  const context = useContext(CourseEnrollmentContext);

  if (!context) {
    throw new Error('useCourseEnrollment must be used within a CourseEnrollmentProvider');
  }

  return context;
};

export { CourseEnrollmentContext, CourseEnrollmentProvider, useCourseEnrollment };
