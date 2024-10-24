import { Button, Flex, HStack, Image, Input, Progress, Stack, Text } from "@chakra-ui/react";
import { useCourseEnrollment } from "../contexts/CourseEnrollmentContext";
import { useState } from "react";
import { ForgotPassword } from "../components/ForgotPassword";
import { InputPassword } from "../components/InputPassword";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderSpin } from "../components/loaderSpin";
import { api } from "../services/axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password minimum of 6 characters."),
})

export default function Signin() {
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const navigate = useNavigate();
    const { isFetching } = useCourseEnrollment();

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    if (isFetching) {
        return <Progress size="xs" colorScheme="primary" isIndeterminate />;
    }

    const handleShowForgotPassword = () => {
        setShowForgotPassword(!showForgotPassword);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const response = await api.post('/login', {
                email: values.email,
                password: values.password,
            });
            if (response.data) {
                console.log(response.data)
                localStorage.setItem('@dataCakto', JSON.stringify(response.data));
                navigate('/courses');
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error.response.data.message || 'Erro no servidor.')
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Stack position="relative" w="full" h="100vh">
            <ToastContainer theme="dark" />
            <Flex
                w="full"
                h="100vh"
                flexDirection={{ base: 'column', md: 'row' }}
            >
                <HStack
                    w={{ base: "100%", md: "50%", lg: '60%' }}
                    h={{ base: "38%", md: "full" }}
                >
                    <Image
                        src="/fundo-login-members.png"
                        width="100%"
                        height="100%"
                    />
                </HStack>
                <Flex
                    w={{ base: "100%", md: "50%", lg: '40%' }}
                    h="full"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent={{ base: "start", md: "center" }}
                    mt={{ base: 5, md: 0 }}
                    position="relative"
                >
                    {showForgotPassword ? (
                        <ForgotPassword handleShowForgotPassword={handleShowForgotPassword} />
                    ) : (
                        <>
                            {/* Logo */}
                            <HStack
                                w={{ base: '70%', md: '70%' }}
                            >
                                <Flex
                                    bg="#212B36"
                                    alignItems="center"
                                    gap={3}
                                    rounded={8}
                                    pr={3}
                                    pl={1}
                                    w={{ base: '60%', md: '40%' }}
                                >
                                    <Image
                                        src="/Rectangle 558.png"
                                        alt="Logo"
                                        w={{ base: "8", md: "10" }}
                                        h={{ base: "8", md: "10" }}
                                        objectFit="fill"
                                    />
                                    <Text>Logo do cliente</Text>
                                </Flex>
                            </HStack>
                            <Flex
                                flexDirection="column"
                                alignItems="start"
                                w={{ base: '70%', md: '70%' }}
                                mt={10}
                                gap={4}
                            >
                                <form
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem',
                                        marginTop: 10
                                    }}
                                    onSubmit={handleSubmit(onSubmit)}
                                >
                                    <Text fontSize="2xl">Entrar</Text>

                                    <Input
                                        placeholder="Email"
                                        h={12}
                                        {...register('email')}
                                    />
                                    {errors.email && <Text color="red.500">{errors.email.message}</Text>}
                                    <InputPassword
                                        placeholder="Senha"
                                        register={{ ...register('password') }}
                                    />
                                    {errors.password && <Text color="red.500">{errors.password.message}</Text>}
                                    <Flex w="full" justifyContent="end"
                                    >
                                        <Text
                                            borderBottomWidth={1}
                                            borderColor="white"
                                            cursor="pointer"
                                            onClick={handleShowForgotPassword}
                                        >
                                            Esqueceu sua senha?
                                        </Text>
                                    </Flex>

                                    <Button
                                        type="submit"
                                        w="full"
                                        h={12}
                                        bg="#683893"
                                        _hover={{ bg: "#683893" }}
                                        color="white"
                                        fontSize="xl"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <LoaderSpin /> : 'Entrar'}
                                    </Button>

                                </form>
                            </Flex>
                        </>
                    )}
                </Flex>
            </Flex>
        </Stack>
    )
}