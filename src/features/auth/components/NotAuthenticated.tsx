import { useEffect } from 'react'
import { LockIcon } from "@chakra-ui/icons";
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Icon,
    Stack,
    Button
} from "@chakra-ui/react";

function handleOpenStudentCourses() {
  window.location.href = 'https://app.cakto.com.br/student/courses'
}

export function NotAuthenticated() {
  useEffect(() => {
    const timeout = setTimeout(()=> {
      handleOpenStudentCourses()
    },5000)

    return () => {
      clearTimeout(timeout)
    }
  },[])
  
  
  return (
      <Stack
      width="100vw"
      height="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Alert
        status="error"
        rounded="md"
        variant="subtle"
        boxShadow="md"
        display="flex"
        gap={5}
        p={8}
        flexDirection="column"
        maxW={400}
      >
        <Icon as={LockIcon} color="red.300" boxSize={16} />
        <AlertTitle fontSize="xl">Ops!</AlertTitle>
        <AlertDescription fontSize="sm" textAlign="center">
          Você precisa estar autenticado para acessar esta página.
        </AlertDescription>
        <Button onClick={handleOpenStudentCourses}>Faça seu login aqui</Button>
      </Alert>
    </Stack>
  )
}