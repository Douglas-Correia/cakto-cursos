import { useEffect, useState } from "react";
import { GetUserProps } from "../types/userStorage";
import { api } from "../services/axios";
import { HeaderCurses } from "../components/header_curses";
import { Flex, HStack, Image, Input, InputGroup, InputRightElement, Select, Text } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { SwiperSlide } from "swiper/react";
import { BoxCourses } from "../components/box_courses";
import { CoursesProps } from "../types/courses";

const CoursesPage = () => {
  const [dataUser, setDataUser] = useState<GetUserProps | null>(null);
  const [coursesByUser, setCourses] = useState<CoursesProps[]>([]);
  const [indexModulo, setIndexModulo] = useState<number | null>(null);
  const userStorage = JSON.parse(localStorage.getItem('@dataCakto') ?? 'null');
  const userId = userStorage?.id;

  useEffect(() => {
    getDataByUser();
  }, []);

  useEffect(() => {
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
    getAllCourses();
  }, []);

  const getDataByUser = async () => {
    try {
      const response = await api.get(`/user/${userId}`);
      if (response.data) {
        setDataUser(response.data);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  const mouseEnter = (index: number) => {
    setIndexModulo(index);
  };

  const mouseLeave = () => {
    setIndexModulo(null);
  };

  return (
    <Flex
      w="full"
      h="full"
      flexDirection="column"
    >
      <HeaderCurses dataUser={dataUser} />

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
            <Select
              h={14}
              placeholder="Filtrar por"
              borderColor="#919EAB33"
              focusBorderColor="#919EAB33"
              _focus={{ boxShadow: 'none' }}
            >
              <option value="option1">Ativo</option>
              <option value="option2">Opção 2</option>
              <option value="option3">Opção 3</option>
            </Select>
          </Flex>

          <Flex
            w="full"
            flexWrap="wrap"
            gap={10}
            pb={16}
          >
            {coursesByUser?.map((course, index) => (
              <SwiperSlide key={index}>
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
                />
              </SwiperSlide>
            ))}
          </Flex>
        </Flex>
        {/* FIM CURSOS */}
      </Flex>
    </Flex>
  );
};

export default CoursesPage;
