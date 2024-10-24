import { useAuth } from "@/features/auth/contexts/AuthContext";
import { NotAuthenticated } from "@/features/auth/components"
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Stack,
} from "@chakra-ui/react";
import { Navigate, useSearchParams } from "react-router-dom";

const RedirectLoginPage: React.FC = () => {
  const [params] = useSearchParams();

  const course = params.get("course");

  const { authenticated, initialized } = useAuth();

  if(!initialized) return (
    <Stack
      width="100vw"
      height="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Alert
        status="loading"
        rounded="md"
        variant="subtle"
        boxShadow="md"
        display="flex"
        gap={5}
        p={8}
        flexDirection="column"
        maxW={400}
      >
        <AlertIcon boxSize={16} />
        <AlertTitle fontSize="xl">Aguarde</AlertTitle>
        <AlertDescription fontSize="sm" textAlign="center">
          Estamos verificando suas credenciais.
        </AlertDescription>
      </Alert>
    </Stack>
  )


  if(!authenticated) return <NotAuthenticated />
  
  return <Navigate to={course ? `/courses/${course}` : "/"} replace={true} /> 
};

export default RedirectLoginPage;
