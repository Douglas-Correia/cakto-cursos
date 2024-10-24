import { mapUserFromFirestore } from "@/features/auth/mappers";
import { FirestoreUserData, User } from "@/features/auth/types";
import { AuthenticatedHttp } from "@/features/common/http/axios";

export const me = (): Promise<User> =>
  AuthenticatedHttp.get<FirestoreUserData>("/usuarios/atual").then(({ data }) =>
    mapUserFromFirestore(data)
  );
