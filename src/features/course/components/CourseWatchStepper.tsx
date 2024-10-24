import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FlexCenter from '@/features/common/components/containers/FlexCenter';
import { useCourseEnrollment } from '@/features/course/contexts/CourseEnrollmentContext';
import { useCourseWatch } from '@/features/course/contexts/CourseWatchContext';
import {
  Button,
  HStack,
  Spinner,
  Stack,
  Text,
  Flex,
  useColorModeValue,
  Box,
  Image,
} from '@chakra-ui/react';


import { FiChevronRight } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';

const CourseWatchStepper = () => {
  const { state } = useLocation();
  const { course, goTo } = useCourseWatch();

  const { isFetching } = useCourseEnrollment();
  const [isOpen, setIsOpen] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleCollapse = (item: string) => {
    setIsOpen((prev) => {
      if (prev.includes(item)) {
        return prev.filter((state) => state !== item);
      }

      return [...prev, item];
    });
  };

  useEffect(() => {
    const lessons = state.lesson.lessons;
    const module = course?.modules.find(({ name }) => name === state.lesson.name) as any;

    if (lessons?.length) {
      toggleCollapse(state?.lesson?.name);

      setTimeout(() => {
        goTo({
          lesson: lessons[0],
          module,
        });

        setIsLoading(false);
      }, 1);
    } else {
      const lessonsWithMoludes = course?.modules.filter(({ lessons }) => !!lessons.length) || [];
      const lastLessonWithModules = lessonsWithMoludes[lessonsWithMoludes?.length - 1];
      toggleCollapse(lastLessonWithModules?.name);
      setIsLoading(false);
    }

    return () => {
      setIsOpen([]);
    };
  }, []);

  if (isFetching || isLoading) {
    return (
      <FlexCenter p={10}>
        <Spinner color="primary.500" />
      </FlexCenter>
    );
  }

  return (
    <Stack gap={5} h="full">
      <Flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="2xl">Conteúdo</Text>
        <Button
          variant="primary"
          borderWidth={1}
          borderColor="white"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          rounded="xl"
        >
          Esconder
          <FiChevronRight />
        </Button>
      </Flex>
      {/* <HStack w="full" flexWrap="wrap">
        <CircularProgress value={progress} color={color + '.500'} trackColor={trackColor}>
          <CircularProgressLabel>{progress}%</CircularProgressLabel>
        </CircularProgress>
        <Text noOfLines={1} fontSize="md" fontWeight="semibold">
          {course?.name}
        </Text>
      </HStack> */}
      {/* <Divider mb={2} borderStyle="dashed" /> */}
      {/* <Stepper
        size="sm"
        index={course?.modules.findIndex((module) => module.id === current.module?.id) || 0}
        colorScheme="primary"
        orientation="vertical"
        gap={0}
      >
        {course?.modules.map((module, moduleIndex) => (
          <Step key={moduleIndex}>
            <StepIndicator
              color="primary.500"
              border="none"
              display="flex"
              alignItems="center"
              justifyContent="center"
              marginBottom={10}
            >
              <StepStatus active={<Icon as={FaCircle} fontSize={12} />} complete={<StepIcon />} />
              <CircularProgress
                value={Math.max(module.progress, 15)}
                color="primary.500"
                size="35px"
                trackColor={trackColor}
                position="absolute"
              />
            </StepIndicator>
            <Stack
              w={{
                base: 230,
                md: 280,
              }}
            >
              <Stack direction="row" alignItems="center" justify="space-between" w="100%">
                <StepTitle
                  {...(module.id === current.module?.id && {
                    color: 'primary.500',
                  })}
                  style={{
                    fontSize: 'large',
                  }}
                >
                  {module.name}
                </StepTitle>
                <Button
                  w={10}
                  h={10}
                  onClick={() => toggleCollapse(module.name)}
                  ml={4}
                  isDisabled={!module.lessons.length}
                >
                  <Icon as={isOpen.includes(module.name) ? ChevronUpIcon : ChevronDownIcon} />
                </Button>
              </Stack>

              <Collapse
                in={isOpen.includes(module.name)}
                animateOpacity
                style={{ marginBottom: 10 }}
              >
                <List>
                  {module.lessons.map((lesson) => (
                    <Tooltip
                      key={lesson.id}
                      label={`Assistir ${lesson.name}`}
                      aria-label={lesson.name}
                      hasArrow
                      variant="solid"
                    >
                      <ListItem
                        as={motion.div}
                        whileHover={{ scale: 1.05 }}
                        transition="all 0.3s"
                        role="group"
                        cursor="pointer"
                        onClick={() =>
                          goTo({
                            lesson,
                            module,
                          })
                        }
                        fontSize="large"
                        // noOfLines={1}
                        bg={lesson.id === current.lesson?.id ? 'primary.400' : 'transparent'}
                        borderRadius="md"
                        py={2}
                      >
                        <Flex align="center" gap={2}>
                          <ListIcon
                            as={lesson.completed ? CheckCircleIcon : FiCircle}
                            color={lesson.completed ? 'primary.500' : 'gray.500'}
                            rounded="full"
                            marginLeft={5}
                          />
                          <Avatar size="sm" name={lesson.cover} src={lesson.cover} />
                          <Text isTruncated>{lesson.name}</Text>
                        </Flex>
                      </ListItem>
                    </Tooltip>
                  ))}
                </List>
              </Collapse>
            </Stack>
            <StepSeparator />
          </Step>
        ))}
        <Step>
          <StepIndicator bg="white" color="primary.500">
            <Icon as={PiCertificateFill} />
          </StepIndicator>
          <Stack>
            <StepTitle>Conclusão</StepTitle>
          </Stack>
          <StepSeparator />
        </Step>
      </Stepper> */}
      <Flex
        alignItems="center"
        justifyContent="space-between"
        borderWidth={1}
        padding={3}
        rounded="lg"
      >
        <Box display="flex" flexDirection="column" gap={2}>
          <Text color={useColorModeValue('white', 'gray.500')}>Módulo 1</Text>
          <Text>Nome do curso</Text>
        </Box>
        <Box color={useColorModeValue('white', 'gray.500')}>
          04/06
        </Box>
      </Flex>

      <HStack display="flex" flexDirection="column" gap={4}>
        <Flex
          alignItems="center"
          justifyContent="space-between"
          w="full"
          mt={4}
          bg="#333e49"
          padding={3}
          rounded="lg"
        >
          <Flex alignItems="center" gap={3}>
            <Text color={useColorModeValue('white', 'gray.500')}>01</Text>
            <Image
              src='../../../../public/similiar.png'
              alt=''
              width={20}
              height={16}
              objectFit="cover"
              rounded="lg"
            />
            <Text
              fontSize="md"
              color={useColorModeValue('white', 'gray.300')}
            >
              Nome da aula
            </Text>
          </Flex>
          <Box>
            <Box rounded="full" padding={2.5} bg="#161c24">

            </Box>
          </Box>
        </Flex>

        <Flex
          alignItems="center"
          justifyContent="space-between"
          w="full"
          mt={4}
          padding={3}
          rounded="lg"
        >
          <Flex alignItems="center" gap={3}>
            <Text color={useColorModeValue('white', 'gray.500')}>01</Text>
            <Image
              src='../../../../public/similiar.png'
              alt=''
              width={20}
              height={16}
              objectFit="cover"
              rounded="lg"
            />
            <Text
              fontSize="md"
              color={useColorModeValue('white', 'gray.300')}
            >
              Nome da aula
            </Text>
          </Flex>
          <Box>
            <Box rounded="full" padding={1} bg="#38ca4f">
              <FaCheck size={12} />
            </Box>
          </Box>
        </Flex>
      </HStack>

    </Stack>
  );
};

export default CourseWatchStepper;
