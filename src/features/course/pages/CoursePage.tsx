import { useCourseProgress } from '@/features/course/hooks/UseCourseProgress';
import {
  Container,
  HStack,
  Image,
  Progress,
  Stack,
  AspectRatio,
  Box,
  Card,
  Text,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import { api } from '../services/axios';
import { BannerCourse, ClassesProps, LastClasse, ModulesProps } from '../types/courses';
import Header from '@/features/common/components/layout/Header';
import { CourseWatchContext, WatchIdsProps } from '../contexts/CourseWatchContext';
import { LuLoader2 } from 'react-icons/lu';
import { GetUserProps } from '../types/userStorage';

const formatTime = (seconds: string | number): string => {
  if (!seconds) return '00:00:00';
  
  if (typeof seconds === 'string' && seconds.includes(':')) {
    return seconds;
  }
  
  const totalSeconds = Math.round(typeof seconds === 'string' ? parseFloat(seconds) : seconds);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);

  return [hours, minutes, remainingSeconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
};

const CoursePage = () => {
  const [course, setCourse] = useState<ClassesProps[]>([]);
  const [search, setSearch] = useState('');
  const [modules, setModules] = useState<ModulesProps | null>(null);
  const [lastClasses, setLastClasses] = useState<LastClasse[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [index, setIndex] = useState(0);
  const [currentBanner, setCurrentBanner] = useState<BannerCourse | null>(null);
  const [initiateImage, setInitiateImage] = useState('');
  const [comunidade, setComunidade] = useState('');
  const [links, setLinks] = useState('');
  const [isLightMode, setIsLightMode] = useState(false);
  const themeMode = localStorage.getItem('chakra-ui-color-mode') ?? '';

  const [indexModulo, setIndexModulo] = useState<number | null>(null);
  const userStorage: GetUserProps = JSON.parse(localStorage.getItem('@dataCakto') ?? 'null');
  const navigate = useNavigate();
  const userId = userStorage?.id;
  const { name, courseId } = useParams();

  const debounceDelay = 500;
  // Cache para restaurar as listas originais
  const [initialModules, setInitialModules] = useState<ModulesProps | null>(null);
  const [initialCourse, setInitialCourse] = useState<ClassesProps[]>([]);

  const { colorPrimary } = useCourseProgress();
  const context = useContext(CourseWatchContext);

  if (!context) {
    throw new Error('useCourseWatch must be used within a CourseWatchProvider');
  }

  const { handleGetCourseWatchIds, bannerCourse, courseWatchIds, courseSelected } = context;

  const totalBanners = bannerCourse.length;
  if (bannerCourse.length <= 0) {
    return window.location.href = '/'
  }

  if (!courseId && !name) {
    return null;
  }

  useEffect(() => {
    if (themeMode === 'light') {
      setIsLightMode(true);
    }
  }, [themeMode]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % totalBanners;
        setCurrentBanner(bannerCourse[newIndex]);
        return newIndex;
      });
    }, 15000);

    return () => clearInterval(intervalId);
  }, [bannerCourse, totalBanners]);

  // Trigger animation reset by updating class
  useEffect(() => {
    const image = document.querySelector('.image-banner') as HTMLImageElement;
    if (image) {
      image.classList.remove('animate');
      void image.offsetWidth; // Trigger reflow to restart animation
      image.classList.add('animate');
    }
  }, [currentBanner]);

  useEffect(() => {
    setIsFetching(true);
    const fetchCourseData = async () => {
      try {
        const responseModules = await api.get(`/user/getAllModulosByUser/${courseId}`);
        if (responseModules.data) {
          // Define initialModules apenas uma vez após carregar
          const initialData: ModulesProps = responseModules.data[0];
          setInitialModules(initialData); // Guarda os módulos iniciais
          setComunidade(initialData?.comunidade);
          setLinks(initialData?.links);
          setModules(initialData);
        }

        if (responseModules.data[0].modulos.length) {
          const allClasses: ClassesProps[] = [];
          for (let i = 0; i < responseModules.data[0].modulos.length; i++) {
            const moduleId = responseModules.data[0].modulos[i]?.id;
            if (moduleId !== undefined) {
              const responseClasses = await api.get(`/user/aulas/${moduleId}/${userId}`);
              if (responseClasses.data !== undefined) {
                allClasses.push(...responseClasses.data);
              }
            }
          }
          setInitialCourse(allClasses); // Guarda as aulas iniciais
          setCourse(allClasses);
        }

      } catch (error: any) {
        console.error(error.response?.data?.message || error.message);
      }
    };

    const fetchGetLastAulas = async () => {
      try {
        const responseLastClasses = await api.get(`/user/getLastAulasWithModulosByUser/${courseId}`);
        if (responseLastClasses.data) {
          setLastClasses(responseLastClasses.data);
        }
      } catch (error: any) {
        console.log(error.response?.data?.message || error.response?.data?.error);
      }
    };

    const handleChamarFuncs = async () => {
      await fetchCourseData();
      await fetchGetLastAulas();
      if (courseSelected?.banner) {
        setInitiateImage(courseSelected?.banner);
      }
      setIsFetching(false);
    };
    handleChamarFuncs();
  }, [userId, courseId]);

  // Hook para buscar e restaurar dados com base na pesquisa
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (search === '') {
        // Restaura os valores iniciais quando a busca está vazia
        setModules(initialModules);
        setCourse(initialCourse);
      } else {
        // Filtra as aulas com base na pesquisa
        const filteredClasses = initialCourse.filter(courseItem =>
          courseItem.nome.toLowerCase().includes(search.toLowerCase())
        );

        // Cria um Set para armazenar os moduloId únicos das aulas encontradas
        const moduleIdsSet = new Set(
          filteredClasses.map(courseItem => courseItem.moduloId)
        );

        // Filtra os módulos com base nos moduloIds das aulas encontradas
        let filteredModules = initialModules?.modulos.filter(module =>
          moduleIdsSet.has(module.id)
        );

        // Caso não haja correspondência nas aulas, filtra os módulos pelo nome do módulo
        if (filteredModules !== undefined && filteredModules.length === 0) {
          filteredModules = initialModules?.modulos.filter(module =>
            module.nome.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Cria a nova estrutura de módulos filtrados
        const newModulesArr: ModulesProps = {
          id: initialModules?.id || '',
          nome: initialModules?.nome || '',
          memberAt: initialModules?.memberAt || '',
          comunidade: initialModules?.comunidade || '',
          links: initialModules?.links || '',
          modulos: filteredModules || [],
        };

        // Atualiza o estado com os dados filtrados
        setLinks(newModulesArr?.links);
        setComunidade(newModulesArr?.comunidade);
        setModules(newModulesArr);
        setCourse(filteredClasses);
      }
    }, debounceDelay);
    return () => clearTimeout(debounceTimer);
  }, [search, initialModules, initialCourse, debounceDelay]);

  const mouseEnter = (index: number) => {
    setIndexModulo(index);
  };

  const mouseLeave = () => {
    setIndexModulo(null);
  };

  const lastClassesRef = useRef<HTMLDivElement | null>(null);

  const moduleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  if (isFetching) {
    return (
      <HStack position="relative" w="full" h="900" justifyContent="center" alignItems="center">
        <Progress
          size="xs"
          sx={{
            '& > div': {
              backgroundColor: colorPrimary,
            },
          }}
          isIndeterminate
          w="full"
          top={0} position="absolute"
        />
        <LuLoader2
          className="skeleton"
          color={colorPrimary}
          size={40}
        />
      </HStack>
    );
  }

  return (
    <Stack w="full" overflowX={'hidden'}>
      <Helmet>
        <title>{name}</title>
        <meta name="name" content={name} />
      </Helmet>
      <Box
        w="full"
        h={{ base: '75svh', md: '55svh' }}
        mb={10}
        position="relative"
      >
        <Image
          src={currentBanner !== null ? currentBanner?.image : initiateImage}
          alt={currentBanner?.titulo}
          w="full"
          h="full"
          objectFit="fill"
          mt={-20}
          className="image-banner"
        />

        <Header
          title={currentBanner !== null ? currentBanner?.titulo : courseSelected?.title}
          description={currentBanner !== null ? currentBanner?.descricao : courseSelected?.description}
          totalBanners={totalBanners}
          indexCurrent={index}
          search={search}
          setSearch={setSearch}
          comunidade={comunidade}
          links={links}
        />
      </Box>

      <Container maxW={1900} px={{ base: 4, md: 8 }}>
        <HStack
          w="full"
          justify="space-between"
          flexWrap="wrap"
          mt="-175px"
        >
        </HStack>
        <Stack py={'60px'} gap={8} zIndex={1}>
          <Stack gap={8} py={2}>
            <Stack gap={5} overflow="hidden" position="relative">
              {lastClasses.length > 0 && (
                <Stack w="100%">
                  <Flex alignContent="center" justifyContent="space-between" my={2}>
                    <Text fontSize={24} fontWeight="bold">
                      Continue assistindo
                    </Text>
                    <HStack>
                      <Box as="button" p={1} borderRadius="full" onClick={() => {
                        if (lastClassesRef.current) {
                          lastClassesRef.current.scrollBy({
                            left: -300,
                            behavior: 'smooth'
                          });
                        }
                      }}>
                        <ChevronLeftIcon color={colorPrimary} boxSize={7} />
                      </Box>
                      <Box as="button" p={1} borderRadius="full" onClick={() => {
                        if (lastClassesRef.current) {
                          lastClassesRef.current.scrollBy({
                            left: 300,
                            behavior: 'smooth'
                          });
                        }
                      }}>
                        <ChevronRightIcon color={colorPrimary} boxSize={7} />
                      </Box>
                    </HStack>
                  </Flex>

                  <Flex
                    position="relative"
                    overflowX="auto"
                    wrap="nowrap"
                    style={{ scrollbarWidth: 'none' }}
                    ref={lastClassesRef}
                  >
                    <Flex
                      flexDirection="row"
                      gap={4}
                    >
                      {lastClasses?.map((lesson) => (
                        <Box key={lesson?.id} flex="0 0 auto" width="300px">
                          <Card
                            rounded="xl"
                            height="130px"
                            overflow="hidden"
                            cursor="pointer"
                            onClick={() => {
                              if (courseId) {
                                const formattedCoursesIds: WatchIdsProps = {
                                  courseId: courseId,
                                  moduloId: lesson?.moduloId,
                                  classeId: lesson?.id,
                                  description: lesson?.description,
                                  currentTime: lesson?.currentTime,
                                  duration: lesson?.duration,
                                  urlVideo: lesson?.urlVideo,
                                  thumbnail: lesson?.thumbnail,
                                  assistida: lesson?.aulaAssistidaEm,
                                  notaClasse: lesson?.notaAula,
                                  logoCurso: lesson?.logoCurso,
                                }
                                handleGetCourseWatchIds(formattedCoursesIds);
                                navigate('/courses/watch');
                              }
                            }}
                          >
                            <Flex flexDirection="row" width="100%" height="130px">
                              <Box flex="0 0 40%" height="100%">
                                <Image
                                  src={lesson?.thumbnail}
                                  alt="A lesson"
                                  objectFit="cover"
                                  w="100%"
                                  h="100%"
                                />
                              </Box>
                              <Box
                                flex="1"
                                bg="#212B36"
                                color="white"
                                display="flex"
                                flexDirection="column"
                                justifyContent="end"
                                p="4"
                              >
                                <Text fontWeight="bold" fontSize="md" mb="2">
                                  {lesson?.moduloNome}
                                </Text>
                                <Text fontWeight="bold" fontSize="md" mb="1">
                                  {lesson?.nomeAula}
                                </Text>
                                <Text fontSize="sm" color="gray">
                                    {lesson?.isCompleted ? `${lesson?.duracaoAula}/${lesson?.duracaoAula}` : `${formatTime(lesson?.currentTime)}/${lesson?.duracaoAula}`}
                                  </Text>
                                {/* <Text fontSize="sm" color="gray">{lesson?.duracaoAula}</Text> */}
                                <Progress
                                  value={lesson?.isCompleted ? 100 : (Number(lesson?.currentTime) / Number(lesson?.duration) * 100) || 0}
                                  sx={{
                                    '& > div': {
                                      backgroundColor: colorPrimary,
                                    },
                                  }}
                                  height="6px"
                                  borderRadius="6px"
                                  width="100%"
                                  mb={1}
                                >
                                  <Box
                                    position="absolute"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    fontSize={13}
                                    fontFamily="mono"
                                    color="white"
                                  >
                                    {lesson?.currentTime || 0}
                                  </Box>
                                </Progress>
                              </Box>
                            </Flex>
                          </Card>
                        </Box>
                      ))}
                    </Flex>
                  </Flex>
                </Stack>
              )}

              {/* MODULOS */}
              {modules?.modulos.map((lesson, index) => (
                <Stack my={6} key={`${lesson?.id}${index}`}>
                  <Flex w="full" justifyContent="space-between">
                    <Flex
                      gap={5}
                      alignItems="center"
                    >
                      <Image
                        src={lesson?.capa}
                        alt={`Imagem ${lesson?.nome}`}
                        w="55px"
                        h="55px"
                        rounded={12}
                        objectFit="fill"
                      />
                      <Box>
                        <Text>{lesson?.nome}</Text>
                        <Flex gap={1}>
                          <Text color="gray">{lesson?.aulas} {lesson?.aulas > 1 ? 'Aulas' : 'Aula'} . {lesson?.somaDuracaoAulas}</Text>
                          {/* <Text color="green">R$ 0.00</Text> */}
                        </Flex>
                      </Box>
                    </Flex>
                    <Box>
                      <Text
                        display="flex"
                        flexDirection={{ base: 'column', md: 'row' }}
                        color={colorPrimary}
                        alignItems={{ base: 'flex-start', md: 'center' }}
                        gap={1}
                      >
                        <Text>{lesson?.porcentagemAssistida}%</Text>
                        <Text color={isLightMode ? 'gray' : 'white'}>do módulo concluido</Text>
                      </Text>
                      <Progress
                        value={lesson?.porcentagemAssistida}
                        sx={{
                          '& > div': {
                            backgroundColor: colorPrimary,
                          },
                        }}
                        height="6px"
                        borderRadius="6px"
                        width="100%"
                        mb={3}
                      >
                        <Box
                          position="absolute"
                          left="50%"
                          transform="translateX(-50%)"
                          fontSize={13}
                          fontFamily="mono"
                          color="white"
                        >
                          {lesson?.porcentagemAssistida}
                        </Box>
                      </Progress>
                      <Flex justifyContent="flex-end" gap={2} mt={2}>
                        <Box
                          as="button"
                          p={1}
                          borderRadius="full"
                          onClick={() => {
                            if (moduleRefs.current[lesson.id]) {
                              moduleRefs.current[lesson.id]?.scrollBy({
                                left: -300,
                                behavior: 'smooth'
                              });
                            }
                          }}
                        >
                          <ChevronLeftIcon color={colorPrimary} boxSize={7} />
                        </Box>
                        <Box
                          as="button"
                          p={1}
                          borderRadius="full"
                          onClick={() => {
                            if (moduleRefs.current[lesson.id]) {
                              moduleRefs.current[lesson.id]?.scrollBy({
                                left: 300,
                                behavior: 'smooth'
                              });
                            }
                          }}
                        >
                          <ChevronRightIcon color={colorPrimary} boxSize={7} />
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>

                  <Flex
                    ref={(el) => moduleRefs.current[lesson.id] = el}
                    position="relative"
                    overflowX="auto"
                    css={{
                      '&::-webkit-scrollbar': {
                        display: 'none'
                      },
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  >
                    <Flex gap={4}>
                      {course?.map((course, index) => (
                        course.moduloId === lesson.id && (
                          <Box
                            key={index}
                            minW={{ base: "250px", sm: "280px", md: "300px" }}
                            as={motion.div}
                            whileHover={{ translateY: -5 }}
                          >
                            <AspectRatio ratio={9 / 12}>
                              <Card
                                state={{ course }}
                                rounded="xl"
                                as={Link}
                                to="/courses/watch"
                                onClick={() => {
                                  if (courseId) {
                                    const formattedCoursesIds: WatchIdsProps = {
                                      courseId: courseId,
                                      moduloId: course?.moduloId,
                                      classeId: course?.id,
                                      description: course?.descricao,
                                      currentTime: course?.currentTime,
                                      duration: course?.duration,
                                      urlVideo: course?.urlVideo,
                                      thumbnail: course?.thumbnail,
                                      assistida: course?.isCompleted,
                                      notaClasse: course?.notaAula,
                                      logoCurso: courseWatchIds?.logoCurso,
                                    }
                                    handleGetCourseWatchIds(formattedCoursesIds);
                                  }
                                }}
                                onMouseEnter={() => mouseEnter(index)}
                                onMouseLeave={mouseLeave}
                              >
                                <Badge
                                  variant="solid"
                                  style={{ backgroundColor: '#212B36' }}
                                  color={colorPrimary}
                                  position="absolute"
                                  top="10px"
                                  right="10px"
                                  borderRadius={5}
                                >
                                  Aula {course?.posicao}
                                </Badge>
                                <Image
                                  src={course?.thumbnail}
                                  alt={course?.nome}
                                  objectFit="cover"
                                  w="full"
                                  h="full"
                                />
                                <Box
                                  position="absolute"
                                  bottom="0"
                                  left="0"
                                  width="100%"
                                  bg="#212B36"
                                  color="white"
                                  display="flex"
                                  flexDirection="column"
                                  justifyContent="center"
                                  p="4"
                                >
                                  <Text fontWeight="bold" fontSize="xl" mb="2">
                                    {course?.nome}
                                  </Text>
                                  <Text fontSize="sm" color="gray">
                                    {course?.isCompleted ? `${course?.duracaoAula}/${course?.duracaoAula}` : `${formatTime(course?.currentTime)}/${course?.duracaoAula}`}
                                  </Text>
                                  <Progress
                                    value={course?.isCompleted ? 100 : (Number(course?.currentTime) / Number(course?.duration) * 100) || 0}
                                    sx={{
                                      '& > div': {
                                        backgroundColor: colorPrimary,
                                      },
                                    }}
                                    height="6px"
                                    borderRadius="6px"
                                    width="100%"
                                    mb={3}
                                  >
                                    <Box
                                      position="absolute"
                                      left="50%"
                                      transform="translateX(-50%)"
                                      fontSize={13}
                                      fontFamily="mono"
                                      color="white"
                                    >
                                      {course?.isCompleted ? course?.duracaoAula : Number(course?.currentTime) || 0}
                                    </Box>
                                  </Progress>
                                  <Box
                                    opacity={indexModulo === index ? 1 : 0}
                                    transition="opacity 0.6s ease-in-out"
                                  >
                                    {indexModulo === index && (
                                      <Box
                                        as="button"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        w="100%"
                                        h="40px"
                                        borderRadius="6"
                                        bg={colorPrimary}
                                        color="white"
                                        fontSize={17}
                                        fontWeight="bold"
                                      >
                                        Continuar Assistindo
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </Card>
                            </AspectRatio>
                          </Box>
                        )
                      ))}
                    </Flex>
                  </Flex>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
};

export default CoursePage;