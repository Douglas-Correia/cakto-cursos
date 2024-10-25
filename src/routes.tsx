import { Route, Routes } from "react-router-dom";
import Signin from "./features/course/pages/signin";
import CoursesPage from "./features/course/pages/CoursesPage";
import CoursePage from "./features/course/pages/CoursePage";
import CourseWatchPage from "./features/course/pages/CourseWatchPage";
import { CourseWatchProvider } from "./features/course/contexts/CourseWatchContext";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Signin />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:name/:courseId" element={<CoursePage />} />
            <Route path="/courses/:videoId/watch" element={
                <CourseWatchProvider>
                    <CourseWatchPage />
                </CourseWatchProvider>
            } />
        </Routes>
    )
}