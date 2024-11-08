import { ChatIcon } from "@chakra-ui/icons";
import { Avatar, Box, Flex, Input, Text, VStack } from "@chakra-ui/react";
import { z } from "zod";
import { api } from "../services/axios";
import { UserStorage } from "../types/userStorage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentsType } from "../types/comments";
interface CommentsProps {
    comentarioId: number;
    comments: CommentsType;
    fetchAllCommentsByClass: () => void;
}

const formSchema = z.object({
    response_comments: z.string(),
})

export function Comments({
    comentarioId,
    fetchAllCommentsByClass,
    comments,
}: CommentsProps) {
    const userStorage: UserStorage = JSON.parse(localStorage.getItem('@dataCakto') ?? '{}');
    const userId = userStorage?.id;

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            response_comments: '',
        }
    })

    const onSubmitResponseComments = async (values: z.infer<typeof formSchema>) => {
        console.log(values)
        console.log(comentarioId)
        reset();
        try {
            const response = await api.post(`/user/createResponseComentarioAula/${comentarioId}`, {
                usuarioId: userId,
                respostaComentario: values.response_comments,
            })
            if (response.data) {
                fetchAllCommentsByClass();
            }
        } catch (error: any) {
            console.log(error);
        }
    }

    return (
        <Box
            bg="#333e49"
            p={4}
            rounded="xl"
            w="full"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            color="white"
        >
            {/* Comentário Principal */}
            <Flex w="100%">
                <Avatar size="md" bg="black" color="white" name={comments?.usuarioName} src={comments?.usuarioPhotoProfile} mr={3} />
                <VStack spacing={1} align="start" w="full">
                    <Text fontWeight="bold" color="white">{comments?.usuarioName}</Text>
                    <Text fontSize="sm" color="gray.300" mt={1}>
                        {comments?.comentario}
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt={2}>{comments?.createdAt}</Text>
                    <form style={{ width: '100%', position: 'relative' }} onSubmit={handleSubmit(onSubmitResponseComments)}>
                        <Input mt={4} {...register('response_comments')} zIndex={50} />
                        <button type="submit" style={{ opacity: 0 }}></button>
                    </form>
                </VStack>
            </Flex>
            <Flex w="100%" justifyContent="flex-end" mt={2} alignItems="center">
                <Text mr={1} fontSize="sm" color="gray.300">{comments?.respostaComentarioAulas.length}</Text>
                <ChatIcon color="gray.300" />
            </Flex>

            {/* Subcomentários */}
            {comments?.respostaComentarioAulas.map((subcomment, index) => (
                <Box
                    key={index}
                    bg="#2b343e"
                    p={3}
                    mt={2}
                    ml={10}
                    rounded="md"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    color="white"
                >
                    <Flex w="100%">
                        <Avatar size="sm" color="white" name={subcomment?.usuarioName} src={subcomment?.usuarioPhotoProfile} mr={3} />
                        <VStack spacing={1} align="start" w="full">
                            <Text fontWeight="bold" fontSize="sm" color="white">{subcomment?.usuarioName}</Text>
                            <Text fontSize="xs" color="gray.300" mt={1}>
                                {subcomment?.respostaComentario}
                            </Text>
                            <Text fontSize="xs" color="gray.400" mt={1}>{subcomment?.createdAt}</Text>
                        </VStack>
                    </Flex>
                </Box>
            ))}
        </Box>
    )
}