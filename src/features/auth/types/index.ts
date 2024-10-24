import { Enrollment } from "@/features/course/types";

export type User = {
  id: string;
  externalId: string;
  email: string;
  subscriptions: Array<Enrollment>;
};

export type FirestoreUserData = {
  id: string;
  externalId: string;
  email: string;
  cursos: Array<{
    cursoId: string;
    inscricao: {
      _seconds: number;
      _nanoseconds: number;
    };
    aulasConcluidas: Array<{
      aulaId: string;
      nota?: number;
      dataConclusao: {
        _seconds: number;
        _nanoseconds: number;
      };
    }>;
  }>;
};
