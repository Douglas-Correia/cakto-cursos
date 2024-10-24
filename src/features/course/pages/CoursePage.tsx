import { useCourseEnrollment } from '@/features/course/contexts/CourseEnrollmentContext';
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
import { Link } from 'react-router-dom';
import { Navigation } from 'swiper/modules';
import { Swiper as SwiperType, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const CoursePage = () => {
  const [indexModulo, setIndexModulo] = useState<number | null>(null);
  const { course, isFetching } = useCourseEnrollment();
  const swiperRefContinue = useRef<any | null>(null);
  const swiperRefModulos = useRef<any | null>(null);

  const { color, progress } = useCourseProgress();

  if (isFetching) {
    return <Progress size="xs" colorScheme="primary" isIndeterminate />;
  }

  if (!course) {
    return null;
  }

  const mouseEnter = (index: number) => {
    setIndexModulo(index);
  };

  const mouseLeave = () => {
    setIndexModulo(null);
  };

  const imageTeste = "../../../../public/overlay_2 1.png"

  console.log(course);

  return (
    <Stack w="full">
      <Helmet>
        <title>{course.name}</title>
        <meta name="name" content={course.name} />
      </Helmet>
      <Box
        w="full"
        h={{ base: '60svh', md: '45svh' }}
        mb={10}
      >
        <Image
          src={imageTeste}
          alt={course.name}
          w="full"
          h="full"
          objectFit="fill"
          mt={-20}
        />
      </Box>

      <Container maxW={1500}>
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
              {course.modules?.length === 0 ? (
                <Text color="gray.500" fontSize="sm">
                  Nenhum conteúdo disponível
                </Text>
              ) : (
                <>
                  <Stack w="100%">
                    <Flex justifyContent="space-between" alignItems="center" width="full">
                      <Text fontSize={24} fontWeight="bold" mb={4}>
                        Continue assistindo
                      </Text>
                      {/* Botões de navegação */}
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
                      py={2}
                      as={SwiperType}
                      grabCursor
                      slidesPerView={1}
                      navigation={false}
                      onSwiper={(swiper: any) => (swiperRefContinue.current = swiper)}
                      breakpoints={{
                        320: {
                          slidesPerView: 1,
                        },
                        640: {
                          slidesPerView: 1,
                        },
                        768: {
                          slidesPerView: 2,
                        },
                        1024: {
                          slidesPerView: 4,
                          spaceBetween: 5,
                        },
                      }}
                      modules={[Navigation]}
                      w="full"
                    >
                      {Array.from({ length: 10 }, (_) => (
                        course.modules?.map((lesson, index) => (
                          <SwiperSlide key={index}>
                            <Card
                              as={Link}
                              to={{
                                pathname: `/courses/${course.id}/watch`,
                              }}
                              state={{ lesson }}
                              rounded="xl"
                              w="300px"
                              height="130px"
                              overflow="hidden"
                            >
                              <Flex flexDirection="row" width="100%" height="130px">
                                {/* A imagem ocupa 40% da largura */}
                                <Box flex="0 0 40%" height="100%">
                                  <Image
                                    src={lesson.cover}
                                    alt="A lesson"
                                    objectFit="cover"
                                    w="100%"
                                    h="100%"
                                  />
                                </Box>

                                {/* O conteúdo ocupa 60% */}
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
                                    {lesson.name}
                                  </Text>
                                  <Text fontWeight="bold" fontSize="md" mb="2">
                                    Nome da aula
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
                        ))
                      ))}
                    </HStack>
                  </Stack>

                  {/* MODULOS */}
                  {course.modules?.map((lesson, index) => (
                    <Stack my={6}>
                      <Flex w="full" justifyContent="space-between">
                        <Flex
                          gap={5}
                          alignItems="center"
                        >
                          <Image
                            src='../../../../public/similiar.png'
                            w="55px"
                            h="55px"
                            rounded={12}
                            objectFit="fill"
                          />
                          <Box>
                            <Text>Borboletas Albinas - Módulo 1</Text>
                            <Flex gap={1}>
                              <Text color="gray">6 Aulas . 05h23m .</Text>
                              <Text color="green">R$ 0.00</Text>
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
                        <SwiperSlide key={index}>
                          <Box as={motion.div} whileHover={{ translateY: -5 }}>
                            <AspectRatio ratio={9 / 12} as={motion.div}>
                              <Card
                                as={Link}
                                to={{
                                  pathname: `/courses/${course.id}/watch`,
                                }}
                                state={{ lesson }}
                                rounded="xl"
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
                                  Aula {lesson?.lessons?.length}
                                  {(lesson.lessons.length > 1 || lesson.lessons.length === 0) && 's'}
                                </Badge>
                                <Image
                                  src={lesson.cover}
                                  alt="A lesson"
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
                                    {lesson.name}
                                  </Text>
                                  <Progress
                                    value={progress}
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
                      </HStack>
                    </Stack>
                  ))}
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
};

export default CoursePage;