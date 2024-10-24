import { getVideoUrl } from "@/features/course/services";
import { Lesson } from "@/features/course/types";
import { useQuery } from "@tanstack/react-query";

const useLessonVideoUrl = (lesson: Lesson | null) =>
  useQuery({
    queryKey: ["lesson.video", lesson?.id],
    queryFn: () => getVideoUrl(lesson!),
    enabled: !!lesson,
  });

export default useLessonVideoUrl;
