import React, { createContext, useState, ReactNode } from 'react';

interface WatchIdsProps {
    courseId: string | undefined;
    moduloId: string | undefined;
    classeId: string | undefined;
}

export interface CourseSelectedProps {
    id: string;
    memberAt: string;
    nome: string;
}

// Definindo o tipo de dados do contexto
interface CourseWatchContextProps {
    courseWatchIds: WatchIdsProps | null;
    courseSelected: CourseSelectedProps | null;
    handleGetCourseWatchIds: (watchIds: WatchIdsProps) => void;
    handleGetCourseSelected: (course: CourseSelectedProps) => void;
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

    const handleGetCourseWatchIds = (watchIds: WatchIdsProps) => {
        setCourseWtachIds(watchIds);
    }

    const handleGetCourseSelected = (course: CourseSelectedProps) => {
        setCourseSelected(course);
    }

    return (
        <CourseWatchContext.Provider value={{ handleGetCourseWatchIds, courseWatchIds, handleGetCourseSelected, courseSelected }}>
            {children}
        </CourseWatchContext.Provider>
    );
};