import { useContext, useEffect, useState } from "react";
import { api } from "../services/axios";
import { HeaderCurses } from "../components/header_curses";
import { Flex, HStack, Image, Input, InputGroup, InputRightElement, Progress, Text, useColorMode } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { BoxCourses } from "../components/box_courses";
import { CoursesProps } from "../types/courses";
import { CourseWatchContext } from "../contexts/CourseWatchContext";
import { LuLoader2 } from "react-icons/lu";
import { useCourseProgress } from "../hooks/UseCourseProgress";

const CoursesPage = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [coursesByUser, setCoursesByUser] = useState<CoursesProps[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CoursesProps[]>([]);
  const [indexModulo, setIndexModulo] = useState<number | null>(null);
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState('dark');
  const { toggleColorMode } = useColorMode();
  const context = useContext(CourseWatchContext);
  const userStorage = JSON.parse(localStorage.getItem('@dataCakto') ?? 'null');
  const userId = userStorage?.id;

  if (!context) {
    throw new Error('useCourseWatch must be used within a CourseWatchProvider');
  }

  const { handleGetCourseSelected, handleGetBannerCourseSelected } = context;

  useEffect(() => {
    setIsFetching(true);
    const getAllCourses = async () => {
      try {
        const response = await api.get(`/user/getAllCursosByUser/${userId}`);
        if (response) {
          setCoursesByUser(response.data);
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

  useEffect(() => {
    if (!search) {
      // Se não houver busca, mostre todos os cursos
      setFilteredCourses(coursesByUser);
    } else {
      // Filtra os cursos com base no valor de search
      const coursesFiltered = coursesByUser.filter((course) =>
        course?.nome.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCourses(coursesFiltered);
    }
  }, [search, coursesByUser]);

  const mouseEnter = (index: number) => {
    setIndexModulo(index);
  };

  const mouseLeave = () => {
    setIndexModulo(null);
  };

  const { colorPrimary } = useCourseProgress();

  if (isFetching) {
    return (
      <HStack position="relative" w="full" h="900" justifyContent="center" alignItems="center">
        <Progress
          size="xs" sx={{
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
    <Flex
      w="full"
      h="full"
      flexDirection="column"
    >
      <HeaderCurses theme={theme} toggleColorMode={toggleColorMode} setTheme={setTheme} />

      {/* BANNER */}
      <HStack
        w="full"
        height={{ base: 100, md: 200, lg: 300, }}
        px={{ base: 5, md: 20, lg: 40, }}
        position="relative"
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
                color={theme === 'dark' ? 'white' : 'black'}
                _focus={{ boxShadow: 'none' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputRightElement
                py={7}
                pointerEvents="none"
                children={<SearchIcon color={theme === 'dark' ? 'white' : 'black'} fontSize="xl" />}
              />
            </InputGroup>
          </Flex>

          <Flex
            w="full"
            flexWrap="wrap"
            gap={10}
            pb={16}
          >
            {search === '' ? coursesByUser?.map((course, index) => (
              <BoxCourses
                key={index}
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
                    nome: course.nome,
                    banner: Array.isArray(course?.bannerCurso) && course?.bannerCurso.length > 0 ? course.bannerCurso[0]?.image : '',
                    title: Array.isArray(course?.bannerCurso) && course?.bannerCurso.length > 0 ? course.bannerCurso[0]?.titulo : '',
                    description: Array.isArray(course?.bannerCurso) && course?.bannerCurso.length > 0 ? course.bannerCurso[0]?.descricao : '',
                  }
                  // Adicionar comunidade e link
                  handleGetCourseSelected(couseFormatted);
                  handleGetBannerCourseSelected(course?.bannerCurso);
                }}
              />
            )) : (
              filteredCourses?.map((course, index) => (
                <BoxCourses
                  key={index}
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
                      nome: course.nome,
                      banner: Array.isArray(course?.bannerCurso) && course?.bannerCurso.length > 0 ? course.bannerCurso[0]?.image : '',
                      title: Array.isArray(course?.bannerCurso) && course?.bannerCurso.length > 0 ? course.bannerCurso[0]?.titulo : '',
                      description: Array.isArray(course?.bannerCurso) && course?.bannerCurso.length > 0 ? course.bannerCurso[0]?.descricao : '',
                    }
                    handleGetCourseSelected(couseFormatted);
                    handleGetBannerCourseSelected(course?.bannerCurso);
                  }}
                />
              ))
            )}
          </Flex>
        </Flex>
        {/* FIM CURSOS */}
      </Flex>
    </Flex>
  );
};

export default CoursesPage;
