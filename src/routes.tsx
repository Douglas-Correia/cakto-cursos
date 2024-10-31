import { Route, Routes } from "react-router-dom";
import Signin from "./features/course/pages/signin";
import CoursesPage from "./features/course/pages/CoursesPage";
import CoursePage from "./features/course/pages/CoursePage";
import CourseWatch from "./features/course/pages/CouseWatch";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Signin />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:name/:courseId" element={<CoursePage />} />
            <Route path="/courses/watch" element={<CourseWatch />} />
            {/* <Route path="/courses/:videoId/:moduloId/watch" element={
                <CourseWatchProvider>
                    <CourseWatchPage />
                </CourseWatchProvider>
            } /> */}
        </Routes>
    )
}