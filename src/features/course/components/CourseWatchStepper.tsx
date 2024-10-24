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
      
      console.log(isOpen)
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
