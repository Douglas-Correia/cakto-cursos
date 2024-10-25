import { useCourseEnrollment } from '@/features/course/contexts/CourseEnrollmentContext';
import { VideoPlayerContext } from '@/features/course/contexts/VideoPlayerContext';
import useCompleteLesson from '@/features/course/hooks/UseCompleteLesson';
import { getLesson } from '@/features/course/services';
import { CourseEnrollment, LessonEnrollment, ModuleEnrollment } from '@/features/course/types';
import { useQuery } from '@tanstack/react-query';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

export type CurrentWatchState = {
  lesson: LessonEnrollment | null;
  module: ModuleEnrollment | null;
};

const MIN_PROGRESS_TO_COMPLETE = 80;

const EmptyWatchState: CurrentWatchState = {
  lesson: null,
  module: null,
};

type CourseWatchContextType = {
  course: CourseEnrollment | null;
  current: CurrentWatchState;
  next: () => void;
  previous: () => void;
  goTo: (lesson: CurrentWatchState) => void;
  isFetching: boolean;
};

const CourseWatchContext = createContext<CourseWatchContextType>({} as CourseWatchContextType);

const CourseWatchProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { course } = useCourseEnrollment();
  const { state } = useLocation();
  const [params] = useSearchParams();
  const { mutateAsync: completeLesson } = useCompleteLesson();
  const { progress, setUrl } = useContext(VideoPlayerContext);

  const lessons = useMemo(
    () =>
      course?.modules.flatMap((module) => module.lessons.map((lesson) => ({ lesson, module }))) ||
      [],
    [course]
  );

  const getLessonById = useCallback(
    (id: string) => {
      return lessons.find(({ lesson }) => lesson.id === id);
    },
    [lessons]
  );

  const getFirstPendingLesson = useCallback(() => {
    return lessons.find(({ lesson }) => !lesson.completed);
  }, [lessons]);

  const getFirstLesson = useCallback(() => {
    return lessons[0];
  }, [lessons]);

  const getDefaultWatchState = useCallback(() => {
    const initialLesson =
      getLessonById(params.get('lesson') || state?.lesson?.id) ||
      getFirstPendingLesson() ||
      getFirstLesson();
      
    return initialLesson || EmptyWatchState;
  }, [getFirstLesson, getFirstPendingLesson, getLessonById, params, state?.lesson?.id]);  

  const [current, setCurrent] = useState<CurrentWatchState>(EmptyWatchState);

  const next = useCallback(() => {
    if (!course || !current.lesson) return;

    if (progress >= MIN_PROGRESS_TO_COMPLETE && !current.lesson.completed) {
      completeLesson({
        courseId: course.id,
        lessonId: current.lesson.id,
      });
    }

    const currentIndex = lessons.findIndex(({ lesson }) => lesson.id === current.lesson?.id);
    if (currentIndex === -1 || currentIndex === lessons.length - 1) return;

    setCurrent(lessons[currentIndex + 1]);
  }, [course, current.lesson, lessons, progress]);

  const previous = useCallback(() => {
    if (!course || !current.lesson) return;

    const currentIndex = lessons.findIndex(({ lesson }) => lesson.id === current.lesson?.id);
    if (currentIndex <= 0) return;

    setCurrent(lessons[currentIndex - 1]);
  }, [course, current.lesson, lessons]);

  const goTo = useCallback((current: CurrentWatchState) => {
    setCurrent(current);
  }, []);

  useEffect(() => {
    if (!current.lesson) {
      setCurrent(getDefaultWatchState());
    }
  }, [current.lesson, getDefaultWatchState]);

  const { data: currentLesson, isFetching } = useQuery({
    queryKey: ['lesson', { id: current.lesson?.id }],
    queryFn: () => (current.lesson?.id ? getLesson(current.lesson.id) : null),
    staleTime: 10000 * 60 * 30,
  });

  useEffect(() => {
    if (currentLesson) {
      setUrl(currentLesson.video || '');
    }
  }, [currentLesson, setUrl]);

  const value = useMemo(
    () => ({
      course,
      current: {
        ...current,
        lesson: currentLesson,
      },
      next,
      previous,
      goTo,
      isFetching,
    }),
    [course, current, currentLesson, goTo, next, previous, isFetching]
  );

  return <CourseWatchContext.Provider value={value}>{children}</CourseWatchContext.Provider>;
};

const useCourseWatch = () => {
  const context = useContext(CourseWatchContext);
  if (!context) throw new Error('useCourseWatch must be used within a CourseWatchProvider');
  return context;
};

export { CourseWatchProvider, useCourseWatch };