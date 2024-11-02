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
import { Link, useParams } from 'react-router-dom';
import { Navigation } from 'swiper/modules';
import { Swiper as SwiperType, SwiperSlide } from 'swiper/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import { api } from '../services/axios';
import { ClassesProps, LastClasse, ModulesProps } from '../types/courses';
import Header from '@/features/common/components/layout/Header';
import { CourseWatchContext, WatchIdsProps } from '../contexts/CourseWatchContext';

function BannerRotativo({ banners }: any) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000); // 4 segundos

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
  }, [banners.length]);
  const currentBanner = banners[0][index];

  return (
    <Image
      src={currentBanner.image}
      alt={currentBanner.titulo}
      w="full"
      h="full"
      objectFit="fill"
      mt={-20}
    />
  )
}

const CoursePage = () => {
  const [course, setCourse] = useState<ClassesProps[]>([]);
  const [modules, setModules] = useState<ModulesProps | null>(null);
  const [lastClasses, setLastClasses] = useState<LastClasse[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const [indexModulo, setIndexModulo] = useState<number | null>(null);
  const swiperRefContinue = useRef<any | null>(null);
  const swiperRefModulos = useRef<any | null>(null);
  const userStorage = JSON.parse(localStorage.getItem('@dataCakto') ?? 'null');
  const userId = userStorage?.id;
  const { name, courseId } = useParams();

  const { color, progress } = useCourseProgress();
  const context = useContext(CourseWatchContext);

  if (!context) {
    throw new Error('useCourseWatch must be used within a CourseWatchProvider');
  }

  const { handleGetCourseWatchIds, bannerCourse } = context;

  if (bannerCourse.length <= 0) {
    return window.location.href = '/'
  }

  if (!courseId && !name) {
    return null;
  }

  useEffect(() => {
    setIsFetching(true);
    const fetchCourseData = async () => {
      try {
        const responseModules = await api.get(`/user/getAllModulosByUser/${userId}/${courseId}`);

        if (responseModules.data) {
          setModules(responseModules.data[0]);
        }

        // Exemplo de obtenção de aulas de um módulo específico
        if (responseModules.data[0].modulos.length) {
          const allClasses: ClassesProps[] = [];  // Array para acumular todas as aulas
          for (let i = 0; i <= responseModules.data[0].modulos.length; i++) {
            const moduleId = responseModules.data[0].modulos[i]?.id;
            if (moduleId !== undefined) {
              const responseClasses = await api.get(`/user/aulas/${moduleId}/${userId}`);
              // Verifica se tem dados de aulas e adiciona ao array acumulador
              if (responseClasses.data !== undefined) {
                allClasses.push(...responseClasses.data);
              }
            }
          }
          setCourse(allClasses);
        }

      } catch (error: any) {
        console.error(error.response?.data?.message || error.message);
      }
    };

    const fetchGetLastAulas = async () => {
      try {
        const responseLastClasses = await api.get(`/user/getLastAulasWithModulosByUser/${userId}/${courseId}`);
        if (responseLastClasses.data) {
          setLastClasses(responseLastClasses.data);
        }
      } catch (error: any) {
        console.log(error.response.data.message || error.response.data.error);
      }
    }

    const handleChamarFuncs = async () => {
      await fetchCourseData();
      await fetchGetLastAulas();
      setIsFetching(false);
    }
    handleChamarFuncs();
  }, [userId, courseId]);

  const mouseEnter = (index: number) => {
    setIndexModulo(index);
  };

  const mouseLeave = () => {
    setIndexModulo(null);
  };

  if (isFetching) {
    return <Progress size="xs" colorScheme="primary" isIndeterminate />;
  }

  console.log(bannerCourse);

  return (
    <Stack w="full" overflowX={'hidden'}>
      <Helmet>
        <title>{name}</title>
        <meta name="name" content={name} />
      </Helmet>
      <Box
        w="full"
        h={{ base: '70svh', md: '50svh' }}
        mb={10}
        position="relative"
      >
        <BannerRotativo banners={bannerCourse} />
        <Header />
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
              <Stack w="100%">
                <Flex justifyContent="space-between" alignItems="center" width="full">
                  <Text fontSize={24} fontWeight="bold" mb={4}>
                    Continue assistindo
                  </Text>

                  <Flex justifyContent="flex-end" gap={2} mt={2}>
                    <Box as="button" p={1} borderRadius="full">
                      <ChevronLeftIcon
                        boxSize={7}
                        onClick={() => swiperRefContinue.current?.slidePrev()}
                      />
                    </Box>
                    <Box as="button" p={1} borderRadius="full">
                      <ChevronRightIcon
                        boxSize={7}
                        onClick={() => swiperRefContinue.current?.slideNext()}
                      />
                    </Box>
                  </Flex>
                </Flex>

                <HStack
                  ref={swiperRefContinue}
                  as={SwiperType}
                  slidesPerView={1}
                  breakpoints={{
                    320: { slidesPerView: 1 },
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4, spaceBetween: 10 },
                  }}
                  modules={[Navigation]}
                  w="full"
                >
                  {lastClasses?.map((lesson) => (
                    <SwiperSlide key={lesson?.id}>
                      <Card
                        rounded="xl"
                        w="300px"
                        height="130px"
                        overflow="hidden"
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
                              {lesson?.ModuloNome}
                            </Text>
                            <Text fontWeight="bold" fontSize="md" mb="2">
                              {lesson?.nomeAula}
                            </Text>
                            <Progress
                              value={25}
                              colorScheme={color}
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
                                {progress}
                              </Box>
                            </Progress>
                          </Box>
                        </Flex>
                      </Card>
                    </SwiperSlide>
                  ))}
                </HStack>
              </Stack>

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
                          <Text color="gray">{lesson?.aulas} Aulas . 05h23m</Text>
                          {/* <Text color="green">R$ 0.00</Text> */}
                        </Flex>
                      </Box>
                    </Flex>
                    <Box>
                      <Text>75% do módulo concluido</Text>
                      <Progress
                        value={75}
                        colorScheme={color}
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
                          {progress}
                        </Box>
                      </Progress>
                      {/* Botões de navegação */}
                      <Flex justifyContent="flex-end" gap={2} mt={2}>
                        <Box as="button" p={1} borderRadius="full">
                          <ChevronLeftIcon
                            boxSize={7}
                            onClick={() => swiperRefModulos.current?.slidePrev()}
                          />
                        </Box>
                        <Box as="button" p={1} borderRadius="full">
                          <ChevronRightIcon
                            boxSize={7}
                            onClick={() => swiperRefModulos.current?.slideNext()}
                          />
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>

                  <HStack
                    ref={swiperRefModulos}
                    py={2}
                    as={SwiperType}
                    grabCursor
                    slidesPerView={1}
                    spaceBetween={20}
                    navigation={false}
                    onSwiper={(swiper: any) => (swiperRefModulos.current = swiper)}
                    breakpoints={{
                      320: {
                        slidesPerView: 2,
                      },
                      640: {
                        slidesPerView: 3,
                      },
                      768: {
                        slidesPerView: 4,
                      },
                      1024: {
                        slidesPerView: 6,
                      },
                    }}
                    modules={[Navigation]}
                    w="full"
                  >
                    {course?.map((course, index) => (
                      course.moduloId === lesson.id && (
                        <SwiperSlide key={index}>
                          <Box as={motion.div} whileHover={{ translateY: -5 }}>
                            <AspectRatio ratio={9 / 12} as={motion.div}>
                              <Card
                                as={Link}
                                to={{
                                  pathname: `/courses/watch`,
                                }}
                                state={{ course }}
                                rounded="xl"
                                onClick={() => {
                                  if (courseId) {
                                    const formattedCoursesIds: WatchIdsProps = {
                                      courseId: courseId,
                                      moduloId: course.moduloId,
                                      classeId: course.id,
                                      description: course.descricao,
                                      urlVideo: course.urlVideo,
                                      assistida: course.assistida,
                                      notaClasse: course?.notaAula,
                                    }
                                    handleGetCourseWatchIds(formattedCoursesIds);
                                  }
                                }}
                                onMouseEnter={() => {
                                  mouseEnter(index)
                                }}
                                onMouseLeave={mouseLeave}
                              >
                                <Badge
                                  variant="solid"
                                  style={{ backgroundColor: '#212B36' }}
                                  color={color}
                                  position="absolute"
                                  top="10px"
                                  right="10px"
                                  borderRadius={5}
                                >
                                  Aula {course.posicao}
                                </Badge>
                                <Image
                                  src={course.thumbnail}
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
                                  <Progress
                                    value={index * 20}
                                    colorScheme={color}
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
                                      {index * 20}
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
                                        bg="green.500"
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
                        </SwiperSlide>
                      )
                    ))}
                  </HStack>
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