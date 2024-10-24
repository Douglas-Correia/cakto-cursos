import { Route, Routes } from "react-router-dom";
import Signin from "./features/course/pages/signin";
import CoursesPage from "./features/course/pages/CoursesPage";

export default function Router() {
    return (
        <Routes>
           <Route path="/" element={<Signin />} />
           <Route path="/courses" element={<CoursesPage />} />
        </Routes>
    )
}