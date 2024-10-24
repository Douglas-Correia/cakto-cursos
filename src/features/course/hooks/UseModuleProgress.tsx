import { useCourseEnrollment } from '@/features/course/contexts/CourseEnrollmentContext';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';

const useModuleProgress = () => {
  const { course } = useCourseEnrollment();

  const { moduleId } = useParams();

  const progress = course?.modules.find(({ id }) => id === moduleId)?.progress || 0;

  const color = useMemo(() => {
    if (progress < 35) {
      return 'red';
    }
    if (progress < 70) {
      return 'yellow';
    }
    return 'green';
  }, [progress]);

  return {
    color,
    progress,
  };
};

export { useModuleProgress };
