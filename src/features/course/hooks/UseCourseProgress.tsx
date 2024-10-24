import { useCourseEnrollment } from "@/features/course/contexts/CourseEnrollmentContext";
import { useMemo } from "react";

const useCourseProgress = () => {
  const { course } = useCourseEnrollment();

  const progress = course?.progress || 0;

  const color = useMemo(() => {
    // if (progress < 35) {
    //   return "red";
    // }
    // if (progress < 70) {
    //   return "yellow";
    // }
    return "green";
  }, [progress]);

  return {
    color,
    progress,
  };
};

export { useCourseProgress };
