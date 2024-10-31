import { Button, ButtonGroup, Container, Flex, HStack, Icon, IconButton, Stack, Text, Tooltip } from "@chakra-ui/react";
import { Helmet } from "react-helmet";
import { FaArrowLeft, FaTrophy } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import PandaVideoPlayer from "../components/PandaVideoPlayer";
import { CheckIcon } from "@chakra-ui/icons";
import { useContext, useEffect, useState } from "react";
import { Materials } from "../components/Materials";
import CourseWatchStepper from "../components/CourseWatchStepper";
import Header from "@/features/common/components/layout/Header";
import LessonRating from "../components/LessonRating";
import { api } from "../services/axios";
import { ClassesProps, ModuleSingleProps } from "../types/courses";
import { CourseWatchContext } from "../contexts/CourseWatchContext";
import { toast, ToastContainer } from "react-toastify";

export default function CourseWatch() {
    const [showDescription, setShowDescription] = useState(true);
    const [showMaterial, setShowMaterial] = useState(false);
    const [classesData, setClassesData] = useState<ClassesProps[]>([]);
    const [moduleSelected, setModuleSelected] = useState<ModuleSingleProps | null>(null);
    const [quantityClasses, setQuantityClasses] = useState(0);
    const [urlVideo, setUrlVideo] = useState('');
    const userStorage = JSON.parse(localStorage.getItem('@dataCakto') ?? '');
    const userId = userStorage?.id;
    const context = useContext(CourseWatchContext);
    if (!context) {
        throw new Error('useCourseWatch must be used within a CourseWatchProvider');
    }

    const { courseWatchIds, handleGetCourseWatchIds } = context;

    useEffect(() => {
        const getUrlVideo = async () => {
            try {
                const response = await api.get(`/getAulaparaAssistir/${courseWatchIds?.classeId}`);
                if (response.data) {
                    setUrlVideo(response.data.url);
                }
            } catch (error: any) {
                console.log(error);
            }
        }
        getUrlVideo();
    }, [courseWatchIds?.classeId, urlVideo]);

    useEffect(() => {
        const getAllClassesByModuleByUser = async () => {
            try {
                const response = await api.get(`/user/aulas/${courseWatchIds?.moduloId}/${userId}`);
                if (response.data) {
                    setClassesData(response.data);
                }
            } catch (error: any) {
                console.log(error);
            }
        }
        const getAllModuleByUser = async () => {
            try {
                const response = await api.get(`/user/getAllModulosByUser/${userId}/${courseWatchIds?.courseId}`);
                if (response.data) {
                    const filterModule: ModuleSingleProps = response.data[0].modulos.find((module: any) => module.id === courseWatchIds?.moduloId);
                    setModuleSelected(filterModule);
                    setQuantityClasses(filterModule.aulas);
                }
            } catch (error: any) {
                console.log(error);
            }
        }
        getAllClassesByModuleByUser();
        getAllModuleByUser();
    }, []);

    const handleDescriptionOrMaterial = (description: boolean, material: boolean) => {
        setShowDescription(description);
        setShowMaterial(material);
    }

    const handleNextClasse = (classeId: string, classeUrlVideo: string) => {
        const newCouseWatchIds = {
            courseId: courseWatchIds?.courseId,
            moduloId: courseWatchIds?.moduloId,
            classeId: classeId,
        }
        handleGetCourseWatchIds(newCouseWatchIds);
        setUrlVideo(classeUrlVideo);
    }

    const handlepreviousClasse = (classeId: string, classeUrlVideo: string) => {
        const newCouseWatchIds = {
            courseId: courseWatchIds?.courseId,
            moduloId: courseWatchIds?.moduloId,
            classeId: classeId,
        }
        handleGetCourseWatchIds(newCouseWatchIds);
        setUrlVideo(classeUrlVideo);
    }

    return (
        <Container maxW="container.xxl" py={6}>
            <ToastContainer theme="dark" />
            <Helmet title="" />
            <Stack w="full" px={{
                base: 3,
                md: 10,
                lg: 20,
            }}>
                <Header />
                <HStack
                    justify="space-between"
                    alignItems="start"
                    mb={3}
                    mt={{
                        base: 8,
                        md: 20,
                    }}
                    gap={6}
                    flexDirection={{
                        base: 'column',
                        md: 'row',
                    }}
                    maxW={{
                        base: "100%",
                        lg: "76%",
                    }}
                >
                    <HStack zIndex={999} as={Link} to={`/courses`} fontWeight="semibold">
                        <FaArrowLeft fontSize={22} />
                        <Text fontSize={18}>Voltar</Text>
                    </HStack>

                    <Tooltip label="Ver progresso" aria-label="Ver progresso" hasArrow>
                        <IconButton
                            colorScheme="primary"
                            aria-label="Ver progresso"
                            size="sm"
                            // onClick={onOpen}
                            display={{ base: 'block', md: 'none' }}
                        >
                            <Icon as={FaTrophy} />
                        </IconButton>
                    </Tooltip>

                    <HStack>
                        <Button
                            rounded="full"
                            size="md"
                            variant="outline"
                            bg="#212b36"
                            borderColor="#212b36"
                            color="white"
                            leftIcon={<FiArrowLeft />}
                            // isDisabled={current.lesson?.position === 1 && current.module?.position === 1}
                            onClick={() => {
                                const currentIndex = classesData.findIndex(
                                    (classe) => classe.id === courseWatchIds?.classeId
                                );

                                if (currentIndex > 0) { // permiti voltar à aula anterior
                                    const previousClasse = classesData[currentIndex - 1];
                                    // Chame a função handlepreviousClasse() com a aula anterior (previousClasse)
                                    handlepreviousClasse(previousClasse.id, previousClasse.urlVideo);
                                } else {
                                    toast.warn("Você já está na primeira aula.");
                                }
                            }}
                        >
                            Aula anterior
                        </Button>
                        <Button
                            rounded="full"
                            size="md"
                            variant="outline"
                            bg="#212b36"
                            color="white"
                            borderColor="#212b36"
                            rightIcon={<FiArrowRight />}
                            // isDisabled={
                            //     current.lesson?.position === current.module?.lessons.length &&
                            //     current.module?.position === course?.modules.length
                            // }
                            onClick={() => {
                                const currentIndex = classesData.findIndex((classe) => classe.id === courseWatchIds?.classeId);

                                if (currentIndex !== -1 && currentIndex < classesData.length - 1) {
                                    const nextClasse = classesData[currentIndex + 1];
                                    // Chame a função handleNextClasse() com a próxima aula (nextClasse)
                                    handleNextClasse(nextClasse.id, nextClasse.urlVideo);
                                } else {
                                    toast.warn("Você já está na última aula.");
                                }
                            }}
                        >
                            Próxima aula
                        </Button>
                    </HStack>
                </HStack>

                <HStack gap={4} align="flex-start">
                    <Stack gap={4} flex={1}>
                        <Flex gap={6}>
                            <HStack w="77%">
                                <PandaVideoPlayer url={urlVideo} />
                            </HStack>
                            <HStack w="23%" bg="#212B36" p={6} rounded="xl">
                                <CourseWatchStepper
                                    classesData={classesData}
                                    videoId={courseWatchIds?.classeId}
                                    nameModule={moduleSelected?.nome}
                                    quantityClasses={quantityClasses}
                                    setUrlVideo={setUrlVideo}
                                />
                            </HStack>
                        </Flex>

                        <Stack>
                            <HStack py={5} justify="space-between" flexWrap="wrap" gap={5}>
                                <Flex flexDirection="column" alignItems="start">
                                    <Text>{moduleSelected?.nome}</Text>
                                    <Text fontSize={28}>Nome da aula</Text>
                                </Flex>
                                <HStack>
                                    <LessonRating
                                        fontSize="sm"
                                        defaultRating={0}
                                        onChange={(rating) => { console.log(rating) }}
                                    />
                                    <Button
                                        rounded="full"
                                        size="lg"
                                        backgroundColor="#152e31"
                                        color="#32a274"
                                        _hover={{ backgroundColor: '#152e37' }}
                                        leftIcon={<CheckIcon />}
                                        variant="solid"
                                    // isDisabled={current.lesson?.completed || !!current.lesson?.error?.length}
                                    // isLoading={complete.isPending}
                                    // onClick={() => {
                                    //     if (!current.lesson || !course) {
                                    //         return;
                                    //     }
                                    //     complete.mutateAsync({
                                    //         courseId: course?.id,
                                    //         lessonId: current.lesson.id,
                                    //     });
                                    // }}
                                    >
                                        Marcar como concluído
                                    </Button>
                                </HStack>
                            </HStack>
                            {/* {current?.lesson?.files?.length && (
                                <Skeleton isLoaded={!isFetching}>
                                    <Box>
                                        <Heading as="h2" size="md" mb={4}>
                                            Arquivos
                                        </Heading>
                                        <List spacing={3}>
                                            {current?.lesson?.files.map((file, index) => (
                                                <ListItem key={index} display="flex" alignItems="center">
                                                    <ListIcon as={FaRegFileLines} color="blue.500" />
                                                    <Box>{file.replace(/^.*?-/, '')}</Box>
                                                    <Button
                                                        ml="auto"
                                                        size="sm"
                                                        colorScheme="blue"
                                                        leftIcon={<DownloadIcon />}
                                                        onClick={() =>
                                                            mutateDownloadLessonFile({
                                                                lessonId: current.lesson?.id || '',
                                                                fileKey: file,
                                                            })
                                                        }
                                                    >
                                                        Baixar
                                                    </Button>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                </Skeleton>
                            )} */}
                        </Stack>
                    </Stack>
                </HStack>

                <HStack alignItems="start" flexDirection="column" gap={3} mt={3}>
                    <ButtonGroup>
                        <Button
                            bg="transparent"
                            color={`${showDescription ? 'white' : '#919EAB'}`}
                            rounded="none"
                            _hover={{ backgroundColor: 'transparent' }}
                            borderBottomWidth={2}
                            borderBottomColor={`${showDescription && '#32a274'}`}
                            onClick={() => handleDescriptionOrMaterial(true, false)}
                        >
                            Descrição
                        </Button>
                        <Button
                            bg="transparent"
                            color={`${showMaterial ? 'white' : '#919EAB'}`}
                            rounded="none"
                            _hover={{ backgroundColor: 'transparent' }}
                            borderBottomWidth={2}
                            borderBottomColor={`${showMaterial && '#32a274'}`}
                            onClick={() => handleDescriptionOrMaterial(false, true)}
                        >
                            Materiais
                        </Button>
                    </ButtonGroup>

                    {showDescription && (
                        <HStack mt={4} pl={4}>
                            <Text color="#919EAB">
                                O incentivo ao avanço tecnológico, assim como a expansão dos mercados mundiais afeta positivamente a correta previsão das condições financeiras e administrativas exigidas.
                            </Text>
                        </HStack>
                    )}
                    {showMaterial && (
                        <HStack
                            style={{
                                width: '100%',
                                overflowX: 'auto',
                            }}
                            maxWidth={{
                                base: 380,
                                md: 768,
                                lg: 1500,
                            }}
                            mt={4}
                            px={4}
                            py={2}
                            gap={6}
                        >
                            {Array.from({ length: 3 }, (_, index) => (
                                <Materials
                                    key={index}
                                // current={}
                                // mutateDownloadLessonFile={mutateDownloadLessonFile}
                                />
                            ))}
                        </HStack>
                    )}
                </HStack>
            </Stack>
        </Container>
    )
}