import { Button, HStack, Stack, Text, Flex, Box, Image } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';
import { ClassesProps } from '../types/courses';
import { useContext, useEffect, useState } from 'react';
import { CourseWatchContext, WatchIdsProps } from '../contexts/CourseWatchContext';
import { api } from '../services/axios';
import { UserStorage } from '../types/userStorage';

interface CourseWatchStepperProps {
  classesData: ClassesProps[];
  videoId: string | undefined;
  nameModule: string | undefined;
  quantityClasses: number;
  setUrlVideo: (text: string) => void;
  handleChangeWidthStepper: (width: string) => void;
  widthWatchStepper: string;
  widthScreen: number;
}

const CourseWatchStepper = ({
  classesData,
  videoId,
  nameModule,
  quantityClasses,
  setUrlVideo,
  handleChangeWidthStepper,
  widthWatchStepper,
  widthScreen,
}: CourseWatchStepperProps) => {
  const [indexCurrentClasse, setIndexCurrentClasse] = useState(0);
  const userStorage: UserStorage = JSON.parse(localStorage.getItem('@dataCakto') ?? '{}');
  const userId = userStorage?.id;

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

  const handleNextClasse = async (classeId: string, classeUrlVideo: string) => {
    const currentIndex = classesData.findIndex((classe) => classe.id === classeId);
    
    if (currentIndex < classesData.length) {
        const response = await api.get(`/user/aulas/${courseWatchIds?.moduloId}/${userId}`);
        const currentClasse = classesData[currentIndex];
        const newClasse: ClassesProps = response.data.find((classe: ClassesProps) => classe?.id === currentClasse.id);
        
        const newCouseWatchIds: WatchIdsProps = {
            courseId: courseWatchIds?.courseId,
            moduloId: courseWatchIds?.moduloId,
            classeId: classeId,
            urlVideo: classeUrlVideo,
            currentTime: newClasse?.currentTime,
            duration: newClasse?.duration,
            thumbnail: currentClasse?.thumbnail,
            assistida: newClasse?.assistida,
            notaClasse: currentClasse?.notaAula,
            description: courseWatchIds?.description,
            logoCurso: courseWatchIds?.logoCurso,
        }
        handleGetCourseWatchIds(newCouseWatchIds);
        setUrlVideo(classeUrlVideo);
    }
  }

  return (
    <Stack gap={5} w="full" h="full" overflowY="auto" style={{ scrollbarWidth: 'none' }}>
      <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap">
        {widthWatchStepper === '27%' && <Text fontSize="2xl">Conteúdo</Text>}
        {widthScreen > 768 && (
          <Button
            variant="primary"
            borderWidth={1}
            borderColor="white"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            rounded="xl"
            onClick={() => {
              if (widthWatchStepper === '27%') {
                handleChangeWidthStepper('8%');
              } else {
                handleChangeWidthStepper('27%');
              }
            }}
          >
            {widthWatchStepper === '27%' ? (
              <>
                Esconder
                <FiChevronRight />
              </>
            ) : (
              <>
                <FiChevronLeft />
                Mostrar
              </>
            )}
          </Button>
        )}
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" flexDirection={widthWatchStepper === '27%' ? 'row' : 'column'} borderWidth={1} padding={3} rounded="lg">
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
              {widthWatchStepper === '27%' && <Text fontSize="md" color="white">
                {classe?.nome}
              </Text>}
            </Flex>
            {widthWatchStepper === '27%' && (
              <Box>
                {classe.assistida ? (
                  <Box rounded="full" padding={1} bg="#38ca4f">
                    <FaCheck size={12} />
                  </Box>
                ) : (
                  <Box rounded="full" padding={2.5} bg="#161c24"></Box>
                )}
              </Box>
            )}
          </Flex>
        ))}
      </HStack>
    </Stack>
  );
};

export default CourseWatchStepper;
