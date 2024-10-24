import CaktoVideoPlayer from '@/features/course/components/CaktoVideoPlayer';
import CourseWatchStepper from '@/features/course/components/CourseWatchStepper';
import LessonRating from '@/features/course/components/LessonRating';
import PandaVideoPlayer from '@/features/course/components/PandaVideoPlayer';
import { useCourseEnrollment } from '@/features/course/contexts/CourseEnrollmentContext';
import { useCourseWatch } from '@/features/course/contexts/CourseWatchContext';
import { VideoPlayerContext } from '@/features/course/contexts/VideoPlayerContext';
import useCompleteLesson from '@/features/course/hooks/UseCompleteLesson';
import { PlayerType } from '@/features/course/types';
import { CheckIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Heading,
  Icon,
  IconButton,
  List,
  ListIcon,
  ListItem,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FaArrowLeft } from 'react-icons/fa';
import { FaRegFileLines, FaTrophy } from 'react-icons/fa6';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Materials } from '../components/Materials';

const CourseWatchPage = () => {
  const [showDescription, setShowDescription] = useState(true);
  const [showMaterial, setShowMaterial] = useState(false);
  const { course, current, next, previous, isFetching } = useCourseWatch();

  const { type } = useContext(VideoPlayerContext);

  const { mutateDownloadLessonFile } = useCourseEnrollment();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const complete = useCompleteLesson();

  const handleDescriptionOrMaterial = (description: boolean, material: boolean) => {
    setShowDescription(description);
    setShowMaterial(material);
  }

  return (
    <Container maxW="container.xxl" py={6}>
      {current.lesson && <Helmet title={`${course?.name}: ${current.lesson?.name}`} />}

      <Stack w="full">
        <HStack
          justify="space-between"
          alignItems="start"
          mb={3}
          mt={{
            base: 8,
            md: 0,
          }}
          gap={6}
          flexDirection={{
            base: 'column',
            md: 'row',
          }}
        >
          <HStack zIndex={999} as={Link} to={`/courses/${course?.id}`} fontWeight="semibold">
            <FaArrowLeft fontSize={22} />
            <Text fontSize={18}>Voltar</Text>
          </HStack>

          <Tooltip label="Ver progresso" aria-label="Ver progresso" hasArrow>
            <IconButton
              colorScheme="primary"
              aria-label="Ver progresso"
              size="sm"
              onClick={onOpen}
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
              isDisabled={current.lesson?.position === 1 && current.module?.position === 1}
              onClick={previous}
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
              isDisabled={
                current.lesson?.position === current.module?.lessons.length &&
                current.module?.position === course?.modules.length
              }
              onClick={() => {
                next();
              }}
            >
              Próxima aula
            </Button>
          </HStack>

        </HStack>
        <HStack gap={4} align="flex-start">
          <Stack gap={4} flex={1}>
            {type === PlayerType.PANDA ? (
              <PandaVideoPlayer url={current.lesson?.video || ''} />
            ) : (
              <CaktoVideoPlayer />
            )}
            <Stack>
              <HStack py={5} justify="space-between" flexWrap="wrap" gap={5}>
                <HStack gap={3}>
                  {/* <Skeleton isLoaded={!isFetching} rounded="full">
                    <Avatar size="lg" name={current.module?.name} src={current.module?.cover} />
                  </Skeleton> */}
                  <Stack flex={1} gap={1}>
                    <Skeleton isLoaded={!isFetching} minW={50}>
                      <Text fontSize="sm" color="gray.500" fontFamily="mono">
                        {current.module?.name || '-'}
                      </Text>
                    </Skeleton>
                    <Skeleton isLoaded={!isFetching} minW={75}>
                      <Heading size="lg">{current.lesson?.name || '-'}</Heading>
                    </Skeleton>
                  </Stack>
                </HStack>

                <HStack gap={6}>
                  <Skeleton isLoaded={!isFetching}>
                    <LessonRating
                      fontSize="sm"
                      defaultRating={current.lesson?.rating || 0}
                      onChange={(rating) => {
                        if (!current.lesson || !course) {
                          return;
                        }
                        complete.mutateAsync({
                          courseId: course?.id,
                          lessonId: current.lesson.id,
                          rating,
                        });
                      }}
                    />
                  </Skeleton>
                  <HStack>
                    <Button
                      rounded="full"
                      size="lg"
                      backgroundColor="#152e31"
                      color="#32a274"
                      _hover={{ backgroundColor: '#152e37' }}
                      leftIcon={<CheckIcon />}
                      variant="solid"
                      isDisabled={current.lesson?.completed || !!current.lesson?.error?.length}
                      isLoading={complete.isPending}
                      onClick={() => {
                        if (!current.lesson || !course) {
                          return;
                        }
                        complete.mutateAsync({
                          courseId: course?.id,
                          lessonId: current.lesson.id,
                        });
                      }}
                    >
                      Marcar como concluído
                    </Button>
                  </HStack>
                </HStack>
              </HStack>
              <Skeleton isLoaded={!isFetching}>
                <Text
                  fontSize="sm"
                  color="gray.500"
                  fontFamily="mono"
                  dangerouslySetInnerHTML={{
                    __html: current.lesson?.description || '',
                  }}
                />
              </Skeleton>

              {current?.lesson?.files?.length && (
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
              )}
            </Stack>
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
                      current={current}
                      isFetching={isFetching}
                      mutateDownloadLessonFile={mutateDownloadLessonFile}
                    />
                  ))}
                </HStack>
              )}
            </HStack>
          </Stack>
          <Card
            w={{
              base: 'full',
              sm: 300,
              md: 350,
            }}
            display={{ base: 'none', md: 'block' }}
            rounded="xl"
            variant="outline"
            border="none"
          >
            <CardBody>
              <CourseWatchStepper />
            </CardBody>
          </Card>
        </HStack>
      </Stack>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={useColorModeValue('white', 'gray.800')}>
          <DrawerCloseButton />
          <DrawerHeader>Progresso</DrawerHeader>

          <DrawerBody>
            <CourseWatchStepper />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default CourseWatchPage;
