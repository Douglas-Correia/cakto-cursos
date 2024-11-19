import { ChatIcon, MinusIcon, PlusSquareIcon } from "@chakra-ui/icons";
import { Avatar, Box, Flex, Input, Text, VStack } from "@chakra-ui/react";
import { z } from "zod";
import { api } from "../services/axios";
import { UserStorage } from "../types/userStorage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentsType } from "../types/comments";
import { useState } from "react";

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
    const [isCommentAll, setIsCommentAll] = useState(true);
    const [areSubcommentsMinimized, setAreSubcommentsMinimized] = useState(true);
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

    const toggleCommentMinimize = () => {
        setIsCommentAll(!isCommentAll);
    };

    const toggleSubcommentsMinimize = () => {
        setAreSubcommentsMinimized(!areSubcommentsMinimized);
    };

    const onSubmitResponseComments = async (values: z.infer<typeof formSchema>) => {
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
            {isCommentAll ? (
                <Flex w="100%" alignItems="center" position="relative">
                    <Avatar size="md" bg="black" color="white" name={comments?.usuarioName} src={comments?.usuarioPhotoProfile} mr={3} />
                    <Text fontWeight="bold" color="white">{comments?.usuarioName}</Text>
                    {isCommentAll ? (
                        <PlusSquareIcon color="gray.300" position="absolute" right={2} top={4} cursor="pointer" zIndex={50} onClick={(e) => {
                            e.stopPropagation();
                            toggleCommentMinimize();
                        }} />
                    ) : <MinusIcon color="gray.300" position="absolute" right={2} top={4} cursor="pointer" zIndex={50} onClick={(e) => {
                        e.stopPropagation();
                        toggleCommentMinimize();
                    }} />}
                </Flex>
            ) : (
                <Flex w="100%" position="relative">
                    <Avatar size="md" bg="black" color="white" name={comments?.usuarioName} src={comments?.usuarioPhotoProfile} mr={3} />
                    {isCommentAll ? (
                        <PlusSquareIcon color="gray.300" position="absolute" right={2} top={4} cursor="pointer" zIndex={50} onClick={(e) => {
                            e.stopPropagation();
                            toggleCommentMinimize();
                        }} />
                    ) : <MinusIcon color="gray.300" position="absolute" right={2} top={1} cursor="pointer" zIndex={50} onClick={(e) => {
                        e.stopPropagation();
                        toggleCommentMinimize();
                    }} />}
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
            )}

            {!isCommentAll ? (
                <>
                    <Flex w="100%" justifyContent="flex-end" mt={2} alignItems="center">
                        <Text mr={1} color="gray.300">{comments?.respostaComentarioAulas.length}</Text>
                        <ChatIcon color="gray.300" mt={1} />
                        {areSubcommentsMinimized ? (
                            <PlusSquareIcon color="gray.300" ml={4} cursor="pointer" onClick={(e) => {
                                e.stopPropagation();
                                toggleSubcommentsMinimize();
                            }} />
                        ) : <MinusIcon color="gray.300" ml={4} cursor="pointer" onClick={(e) => {
                            e.stopPropagation();
                            toggleSubcommentsMinimize();
                        }} />}
                    </Flex>

                    {!areSubcommentsMinimized && comments?.respostaComentarioAulas.map((subcomment, index) => (
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

                    {areSubcommentsMinimized && comments?.respostaComentarioAulas.length > 0 && (
                        <Box
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
                            <Flex w="100%" alignItems="center">
                                <Avatar size="sm" color="white" name={comments?.respostaComentarioAulas[0]?.usuarioName} src={comments?.respostaComentarioAulas[0]?.usuarioPhotoProfile} mr={3} />
                                <Text fontWeight="bold" fontSize="sm" color="white">{comments?.respostaComentarioAulas[0]?.usuarioName}</Text>
                            </Flex>
                        </Box>
                    )}
                </>
            ) : null}
        </Box>
    )
}