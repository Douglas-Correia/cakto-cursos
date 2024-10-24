import { useAuth } from "@/features/auth/contexts/AuthContext";
import { completeLesson } from "@/features/course/services";
import { useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";

const useCompleteLesson = () => {
  const toast = useToast();

  const { setUser } = useAuth();

  return useMutation({
    mutationFn: completeLesson,
    onSuccess: (user) => {
      toast({
        description: "Aula concluída com sucesso",
        status: "success",
      });

      setUser(user);
    },
    onError: () => {
      toast({
        description: "Erro ao concluir aula",
        status: "error",
      });
    },
  });
};

export default useCompleteLesson;
