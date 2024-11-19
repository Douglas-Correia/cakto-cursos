import { Button, Flex, HStack, Image, Input, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { InputPassword } from "./InputPassword";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { api } from "../services/axios";
import { toast } from "react-toastify";
import { LoaderSpin } from "./loaderSpin";
interface ForgotPasswordProps {
    handleShowForgotPassword: () => void;
}

const formSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    repeat_password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(({ password, repeat_password }) => password === repeat_password, {
    message: 'Passwords do not match',
    path: ['repeat_password'],
});

const formSchemaEmail = z.object({
    email: z.string().email(),
});

export function ForgotPassword({ handleShowForgotPassword }: ForgotPasswordProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showAlterPassword, setShowAlterPassword] = useState(true);
    const [email, setEmail] = useState('');
    const [isLightMode, setIsLightMode] = useState(false);
    const themeMode = localStorage.getItem('chakra-ui-color-mode') ?? '';

    const securityOne = useRef<HTMLInputElement>(null);
    const securityTwo = useRef<HTMLInputElement>(null);
    const securityThree = useRef<HTMLInputElement>(null);
    const securityFour = useRef<HTMLInputElement>(null);
    const securityFive = useRef<HTMLInputElement>(null);
    const securitySix = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsLightMode(themeMode === 'light');
    }, [themeMode]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>, nextRef: React.RefObject<HTMLInputElement> | null) => {
        if (e.target.value.length === 1 && nextRef!.current) {
            return nextRef!.current.focus();
        }
    };

    const {
        register,
        handleSubmit,
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const {
        register: registerEmail,
        handleSubmit: handleSubmitEmail,
        reset,
    } = useForm<z.infer<typeof formSchemaEmail>>({
        resolver: zodResolver(formSchemaEmail),
    });

    const handleShowAlterPassword = () => {
        setShowAlterPassword(!showAlterPassword);
    };

    const handleSubmitSendOrder = async () => {
        handleShowAlterPassword();
    };

    const onSubmitEmail = async (values: z.infer<typeof formSchemaEmail>) => {
        setIsLoading(true);
        try {
            const response = await api.post('/forgot-password', {
                email: values.email,
            });
            if (response.data) {
                setEmail(values.email);
                handleSubmitSendOrder();
                reset();
            }
        } catch (error: any) {
            setIsLoading(false);
            console.log(error);
            toast.error(error.response.data.message)
        } finally {
            setIsLoading(false);
        }
        console.log(values);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        let code = '';
        if (securityOne.current !== null &&
            securityTwo.current !== null &&
            securityThree.current !== null &&
            securityFour.current !== null &&
            securityFive.current !== null &&
            securitySix.current) {

            code = `${securityOne.current.value}${securityTwo.current.value}${securityThree.current.value}${securityFour.current.value}${securityFive.current.value}${securitySix.current.value}`;
        } else {
            toast.warn('Preencha todos os campos para prosseguir.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.post('forgot-validate-password', {
                email: email,
                code,
                password: values.password,
            });
            if (response.data) {
                toast.success('Senha alterada com sucesso.');
                handleShowForgotPassword();
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error.response.data.message || error.response.data.error);
        } finally {
            setIsLoading(true);
        }
    };

    return (
        <>
            {/* Logo */}
            <HStack
                w={{ base: '70%', md: '70%' }}
                position={{ base: 'sticky', md: 'absolute' }}
                left={20}
                top={10}
            >
                <Flex
                    bg="#212B36"
                    alignItems="center"
                    gap={3}
                    rounded={8}
                    pr={3}
                    pl={1}
                    w={{ base: '70%', md: '70%' }}
                >
                    <Image
                        src="/Rectangle 558.png"
                        alt="Logo"
                        w={{ base: "8", md: "10" }}
                        h={{ base: "8", md: "10" }}
                        objectFit="fill"
                    />
                    <Text color="white">Logo do cliente</Text>
                </Flex>
            </HStack>
            <Flex
                flexDirection="column"
                alignItems="center"
                w={{ base: '70%', md: '70%' }}
                mt={{ base: 0, md: 10 }}
                gap={4}
            >
                <HStack mt={{ base: 2, md: 30 }} flexDirection="column">
                    {!showAlterPassword ? (
                        <>
                            <Image
                                src="/send 1.png"
                            />
                            <Text fontSize={24}>Pedido enviado com sucesso.</Text>
                            <Text fontSize={16} color="#919EAB" textAlign="center">
                                Enviamos um e-mail de confirmação de 6 dígitos para o seu e-mail. Digite o código na caixa abaixo para verificar seu e-mail.
                            </Text>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Flex gap={3} mt={4}>
                                    <Input
                                        h={12}
                                        px={{ base: 4, md: 3, lg: 2 }}
                                        placeholder="-"
                                        textAlign="center"
                                        fontSize={{ base: 17, md: 17, lg: 28 }}
                                        autoFocus
                                        maxLength={1}
                                        ref={securityOne}
                                        onChange={(e) => handleInput(e, securityTwo)}
                                    />
                                    <Input
                                        h={12}
                                        px={{ base: 4, md: 3, lg: 2 }}
                                        placeholder="-"
                                        textAlign="center"
                                        fontSize={{ base: 17, md: 17, lg: 28 }}
                                        maxLength={1}
                                        ref={securityTwo}
                                        onChange={(e) => handleInput(e, securityThree)}
                                    />
                                    <Input
                                        h={12}
                                        px={{ base: 4, md: 3, lg: 2 }}
                                        placeholder="-"
                                        textAlign="center"
                                        fontSize={{ base: 17, md: 17, lg: 28 }}
                                        maxLength={1}
                                        ref={securityThree}
                                        onChange={(e) => handleInput(e, securityFour)}
                                    />
                                    <Input
                                        h={12}
                                        px={{ base: 4, md: 3, lg: 2 }}
                                        placeholder="-"
                                        textAlign="center"
                                        fontSize={{ base: 17, md: 17, lg: 28 }}
                                        maxLength={1}
                                        ref={securityFour}
                                        onChange={(e) => handleInput(e, securityFive)}
                                    />
                                    <Input
                                        h={12}
                                        px={{ base: 4, md: 3, lg: 2 }}
                                        placeholder="-"
                                        textAlign="center"
                                        fontSize={{ base: 17, md: 17, lg: 28 }}
                                        maxLength={1}
                                        ref={securityFive}
                                        onChange={(e) => handleInput(e, securitySix)}
                                    />
                                    <Input
                                        h={12}
                                        px={{ base: 4, md: 3, lg: 2 }}
                                        placeholder="-"
                                        textAlign="center"
                                        fontSize={{ base: 17, md: 17, lg: 28 }}
                                        maxLength={1}
                                        ref={securitySix}
                                        onChange={(e) => handleInput(e, securitySix)}
                                    />
                                </Flex>
                                <HStack w="full" gap={4} flexDirection="column" mt={4}>
                                    <InputPassword
                                        placeholder="Senha"
                                        register={register('password')}
                                    />
                                    <InputPassword
                                        placeholder="Confirme a nova senha"
                                        register={register('repeat_password')}
                                    />
                                </HStack>
                                <HStack w="full">
                                    <Button
                                        type="submit"
                                        w="full"
                                        h={12}
                                        mt={4}
                                        bg="#683893"
                                        _hover={{ bg: "#683893" }}
                                        color="white"
                                        fontSize="xl"
                                    >
                                        {isLoading ? <LoaderSpin /> : 'Atualizar senha'}
                                    </Button>
                                </HStack>
                            </form>
                            <Text fontSize={16} mt={4}>
                                Não tem um código?
                                <Button bg="transparent" _hover={{ bg: 'transparent' }} color="#683893">
                                    Reenviar código
                                </Button>
                            </Text>
                        </>
                    ) : (
                        <>
                            <Image
                                src="/lock 1.png"
                            />
                            <Text fontSize={24}>Esqueceu sua senha?</Text>
                            <Text fontSize={16} color="#919EAB" textAlign="center">
                                Digite o endereço de e-mail associado à sua conta e enviaremos um link para redefinir sua senha.
                            </Text>

                            <form
                                style={{ width: '100%' }}
                                onSubmit={handleSubmitEmail(onSubmitEmail)}
                            >
                                <Input
                                    placeholder="Email"
                                    h={12}
                                    {...registerEmail('email')}
                                />
                                <HStack w="full">
                                    <Button
                                        type="submit"
                                        w="full"
                                        h={12}
                                        mt={4}
                                        bg="#683893"
                                        _hover={{ bg: "#683893" }}
                                        color="white"
                                        fontSize="xl"
                                    >
                                        {isLoading ? <LoaderSpin /> : 'Enviar pedido'}
                                    </Button>
                                </HStack>
                            </form>

                        </>
                    )}
                    <HStack w="full">
                        <Button
                            w="full"
                            bg="transparent"
                            gap={3}
                            _hover={{ bg: "transparent" }}
                            color={isLightMode ? 'black' : 'white'}
                            onClick={handleShowForgotPassword}
                        >
                            <FaChevronLeft />
                            Voltar ao login
                        </Button>
                    </HStack>
                </HStack>
            </Flex>
        </>
    );
}
