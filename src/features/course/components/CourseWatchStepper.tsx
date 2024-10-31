import { Button, HStack, Stack, Text, Flex, Box, Image } from '@chakra-ui/react';
import { FiChevronRight } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';
import { ClassesProps } from '../types/courses';
import { useContext, useEffect, useState } from 'react';
import { CourseWatchContext } from '../contexts/CourseWatchContext';

interface CourseWatchStepperProps {
  classesData: ClassesProps[];
  videoId: string | undefined;
  nameModule: string | undefined;
  quantityClasses: number;
  setUrlVideo: (text: string) => void;
}

const CourseWatchStepper = ({
  classesData,
  videoId,
  nameModule,
  quantityClasses,
  setUrlVideo,
}: CourseWatchStepperProps) => {
  const [indexCurrentClasse, setIndexCurrentClasse] = useState(0);

  const context = useContext(CourseWatchContext);
  if (!context) {
    throw new Error('useCourseWatch must be used within a CourseWatchProvider');
  }

  const { courseSelected, handleGetCourseWatchIds, courseWatchIds } = context;

  // Atualizar indexCurrentClasse sempre que videoId ou classesData mudar
  useEffect(() => {
    const currentIndex = classesData.findIndex((classe) => classe.id === videoId);
    if (currentIndex !== -1) {
      setIndexCurrentClasse(currentIndex + 1);
    }
  }, [videoId, classesData]);

  const handleNextClasse = (classeId: string, classeUrlVideo: string) => {
    const newCouseWatchIds = {
      courseId: courseWatchIds?.courseId,
      moduloId: courseWatchIds?.moduloId,
      classeId: classeId,
    }
    handleGetCourseWatchIds(newCouseWatchIds);
    setUrlVideo(classeUrlVideo);
  }

  return (
    <Stack gap={5} w="full" h="full">
      <Flex justifyContent="space-between" alignItems="center">
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
      <Flex alignItems="center" justifyContent="space-between" borderWidth={1} padding={3} rounded="lg">
        <Box display="flex" flexDirection="column" gap={2}>
          <Text color="white">{nameModule}</Text>
          <Text>{courseSelected?.nome}</Text>
        </Box>
        <Box color="white">
          {indexCurrentClasse < 10 ? `0${indexCurrentClasse}` : indexCurrentClasse}/{quantityClasses < 9 ? `0${quantityClasses}` : quantityClasses}
        </Box>
      </Flex>

      <HStack display="flex" flexDirection="column" gap={4}>
        {classesData?.map((classe, index) => (
          <Flex
            key={classe.id}
            alignItems="center"
            justifyContent="space-between"
            w="full"
            mt={4}
            bg={`${classe.id === videoId ? '#333e49' : ''}`}
            padding={3}
            rounded="lg"
            cursor="pointer"
            onClick={() => handleNextClasse(classe.id, classe.urlVideo)}
          >
            <Flex alignItems="center" gap={3}>
              <Text color="white">{index + 1}</Text>
              <Image
                src={classe?.thumbnail}
                alt={classe?.nome}
                width={20}
                height={16}
                objectFit="cover"
                rounded="lg"
              />
              <Text fontSize="md" color="white">
                {classe?.nome}
              </Text>
            </Flex>
            <Box>
              {classe.assistida ? (
                <Box rounded="full" padding={1} bg="#38ca4f">
                  <FaCheck size={12} />
                </Box>
              ) : (
                <Box rounded="full" padding={2.5} bg="#161c24"></Box>
              )}
            </Box>
          </Flex>
        ))}
      </HStack>
    </Stack>
  );
};

export default CourseWatchStepper;
