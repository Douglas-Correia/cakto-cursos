import { useCourseEnrollment } from "@/features/course/contexts/CourseEnrollmentContext";
import { useMemo } from "react";
import { GetUserProps } from "../types/userStorage";

const useCourseProgress = () => {
  const { course } = useCourseEnrollment();
  const userStorage: GetUserProps = JSON.parse(localStorage.getItem('@dataCakto') ?? 'null');
  const progress = course?.progress || 0;

  // Extrai a cor personalizada
  const colorPrimary = useMemo(() => {
    return userStorage?.coresSystemUsuario?.corPrimaria || 'green';
  }, [userStorage]);

  return {
    colorPrimary,
    progress,
  };
};

export { useCourseProgress };
