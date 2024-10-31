import { useContext, useEffect, useState } from "react";
import { api } from "../services/axios";
import { HeaderCurses } from "../components/header_curses";
import { Flex, HStack, Image, Input, InputGroup, InputRightElement, Progress, Text } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { BoxCourses } from "../components/box_courses";
import { CoursesProps } from "../types/courses";
import { CourseWatchContext } from "../contexts/CourseWatchContext";

const CoursesPage = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [coursesByUser, setCourses] = useState<CoursesProps[]>([]);
  const [indexModulo, setIndexModulo] = useState<number | null>(null);
  const context = useContext(CourseWatchContext);
  const userStorage = JSON.parse(localStorage.getItem('@dataCakto') ?? 'null');
  const userId = userStorage?.id;

  if (!context) {
    throw new Error('useCourseWatch must be used within a CourseWatchProvider');
  }

  const { handleGetCourseSelected } = context;

  useEffect(() => {
    setIsFetching(true);
    const getAllCourses = async () => {
      try {
        const response = await api.get(`/user/getAllCursosByUser/${userId}`);
        if (response) {
          console.log(response.data);
          setCourses(response.data);
        }
      } catch (error: any) {
        console.log(error);
      }
    }
    const handleChamarAllPromise = async () => {
      await getAllCourses();
      setIsFetching(false);
    }
    handleChamarAllPromise();
  }, []);

  const mouseEnter = (index: number) => {
    setIndexModulo(index);
  };

  const mouseLeave = () => {
    setIndexModulo(null);
  };

  if (isFetching) {
    return <Progress size="xs" colorScheme="primary" isIndeterminate />;
  }

  return (
    <Flex
      w="full"
      h="full"
      flexDirection="column"
    >
      <HeaderCurses />

      {/* BANNER */}
      <HStack
        w="full"
        height={{ base: 100, md: 200, lg: 300, }}
        px={{ base: 5, md: 20, lg: 40, }}
      >
        <Image
          src="/banner.png"
          w="full"
          h="full"
          objectFit="contain"
        />
      </HStack>
      {/* FIM BANNER */}

      <Flex
        w="full"
        height={{ base: 100, md: 200, lg: 300, }}
        px={{ base: 5, md: 20, lg: 40, }}
        gap={6}
      >
        {/* CURSOS */}
        <Flex
          w="100%"
          h="full"
          flexDirection="column"
          gap={3}
        >
          <Text fontSize="3xl">Meus cursos</Text>
          <Flex gap={3}>
            <InputGroup>
              <Input
                h={14}
                placeholder="Pesquisar"
                borderColor="#919EAB33"
                focusBorderColor="#919EAB33"
                _focus={{ boxShadow: 'none' }}
              />
              <InputRightElement
                py={7}
                pointerEvents="none"
                children={<SearchIcon color="gray.300" fontSize="xl" />}
              />
            </InputGroup>
          </Flex>

          <Flex
            w="full"
            flexWrap="wrap"
            gap={10}
            pb={16}
          >
            {coursesByUser?.map((course, index) => (
              <BoxCourses
                img={course?.logoCurso}
                index={index}
                indexModulo={indexModulo}
                mouseEnter={() => {
                  mouseEnter(index);
                }}
                mouseLeave={mouseLeave}
                name={course?.nome}
                textBtn="Acessar conteúdo"
                courseId={course.id}
                onClick={() => {
                  const couseFormatted = {
                    id: course.id,
                    memberAt: course.memberAt,
                    nome: course.nome
                  }
                  handleGetCourseSelected(couseFormatted);
                }}
              />
            ))}
          </Flex>
        </Flex>
        {/* FIM CURSOS */}
      </Flex>
    </Flex>
  );
};

export default CoursesPage;
