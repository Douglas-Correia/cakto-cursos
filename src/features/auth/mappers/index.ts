import { FirestoreUserData } from "@/features/auth/types";
import moment from "moment";

export const mapUserFromFirestore = (user: FirestoreUserData) => ({
  id: user.id,
  externalId: user.externalId,
  email: user.email,
  subscriptions: user.cursos?.map((curso) => ({
    courseId: curso.cursoId,
    subscribedAt: moment.unix(curso.inscricao?._seconds).toDate(),
    // check if it is array of aulasConcluidas
    completedLessons: (Array.isArray(curso.aulasConcluidas)
      ? curso.aulasConcluidas
      : []
    ).map((aula) => ({
      id: aula.aulaId,
      rating: aula?.nota,
      completedAt: moment.unix(aula.dataConclusao?._seconds).toDate(),
    })),
  })),
});
