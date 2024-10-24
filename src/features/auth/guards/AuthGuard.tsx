import { useAuth } from "@/features/auth/contexts/AuthContext";
import { NotAuthenticated } from "@/features/auth/components"
import {
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const { authenticated, initialized } = useAuth();

  if (!initialized) {
    return (
      <Stack
        width="100vw"
        height="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner color="primary.600" size="xl" />
      </Stack>
    );
  }

  if (!authenticated) return  <NotAuthenticated />

  return <>{children}</>;
};

export default AuthGuard;
