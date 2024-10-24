import AuthGuard from '@/features/auth/guards/AuthGuard';
import RedirectLoginPage from '@/features/auth/pages/RedirectLoginPage';
import MainLayout from '@/features/common/layouts/MainLayout';
import { CourseEnrollmentProvider } from '@/features/course/contexts/CourseEnrollmentContext';
import { CourseWatchProvider } from '@/features/course/contexts/CourseWatchContext';
import { VideoPlayerProvider } from '@/features/course/contexts/VideoPlayerContext';
import CoursePage from '@/features/course/pages/CoursePage';
import CourseWatchPage from '@/features/course/pages/CourseWatchPage';
import CoursesPage from '@/features/course/pages/CoursesPage';
import { Navigate, useRoutes } from 'react-router-dom';
import Signin from './features/course/pages/signin';

export default function Routes() {
  return useRoutes([
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: '',
          element: <Navigate to="/courses" />,
        },
        {
          path: 'courses',
          children: [
            {
              path: '',
              element: <CoursesPage />,
            },
            {
              path: ':id',
              element: <CourseEnrollmentProvider />,
              children: [
                {
                  path: '',
                  element: <CoursePage />,
                },
                {
                  path: 'watch',
                  element: (
                    <VideoPlayerProvider>
                      <CourseWatchProvider>
                        <CourseWatchPage />
                      </CourseWatchProvider>
                    </VideoPlayerProvider>
                  ),
                },
              ],
            },
          ],
        },
        {
          path: '*',
          element: <div>Not Found</div>,
        },
      ],
    },
    {
      path: '/auth',
      children: [
        {
          path: 'redirect',
          element: <RedirectLoginPage />,
        },
      ],
    },
    {
      path: '/signin',
      children: [
        {
          path: 'signin',
          element: <Signin />
        }
      ]
    }
  ]);
}
