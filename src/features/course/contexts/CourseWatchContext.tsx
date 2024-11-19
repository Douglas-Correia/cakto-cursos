import React, { createContext, useState, ReactNode } from 'react';
import { BannerCourse } from '../types/courses';

export interface WatchIdsProps {
    courseId: string | undefined;
    moduloId: string | undefined;
    classeId: string | undefined;
    description: string | undefined;
    urlVideo: string | undefined;
    currentTime: string | undefined;
    duration: string | undefined;
    thumbnail: string | undefined;
    assistida: boolean | undefined;
    notaClasse: number | undefined;
    logoCurso: string | undefined;
}
export interface CourseSelectedProps {
    id: string;
    memberAt: string;
    nome: string;
    banner: string;
    title: string;
    description: string;
}

// Definindo o tipo de dados do contexto
interface CourseWatchContextProps {
    courseWatchIds: WatchIdsProps | null;
    courseSelected: CourseSelectedProps | null;
    bannerCourse: BannerCourse | any;
    handleGetCourseWatchIds: (watchIds: WatchIdsProps) => void;
    handleGetCourseSelected: (course: CourseSelectedProps) => void;
    handleGetBannerCourseSelected: (banner: BannerCourse) => void;

}

// Criando o contexto
export const CourseWatchContext = createContext<CourseWatchContextProps | undefined>(undefined);

// Provedor do contexto
interface CourseWatchProviderProps {
    children: ReactNode;
}

export const CourseWatchProvider: React.FC<CourseWatchProviderProps> = ({ children }) => {
    const [courseWatchIds, setCourseWtachIds] = useState<WatchIdsProps | null>(null);
    const [courseSelected, setCourseSelected] = useState<CourseSelectedProps | null>(null);
    const [bannerCourse, setBannerCourse] = useState<BannerCourse | any>([]);

    const handleGetCourseWatchIds = (watchIds: WatchIdsProps) => {
        setCourseWtachIds(watchIds);
    }

    const handleGetCourseSelected = (course: CourseSelectedProps) => {
        setCourseSelected(course);
    }

    const handleGetBannerCourseSelected = (banner: BannerCourse) => {
        setBannerCourse(banner);
    };

    return (
        <CourseWatchContext.Provider value={{
            handleGetCourseWatchIds,
            courseWatchIds,
            handleGetCourseSelected,
            courseSelected,
            handleGetBannerCourseSelected,
            bannerCourse,
        }}>
            {children}
        </CourseWatchContext.Provider>
    );
};