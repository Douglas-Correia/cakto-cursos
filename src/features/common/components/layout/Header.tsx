import { CourseWatchContext } from '@/features/course/contexts/CourseWatchContext';
import { useCourseProgress } from '@/features/course/hooks/UseCourseProgress';
import { api } from '@/features/course/services/axios';
import { GetUserProps } from '@/features/course/types/userStorage';
import { SearchIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface HeaderProps {
  title?: string | undefined;
  description?: string | undefined;
  totalBanners?: number;
  indexCurrent?: number;
  search?: string;
  setSearch?: ((text: string) => void) | undefined;
}

const Header = ({
  title,
  description,
  totalBanners,
  indexCurrent,
  search,
  setSearch,
}: HeaderProps) => {
  const [dataUser, setDataUser] = useState<GetUserProps | null>(null);
  const [courseWatch, setCourseWatch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Captura o objeto de localização
  const context = useContext(CourseWatchContext);
  const userStorage = JSON.parse(localStorage.getItem('@dataCakto') ?? 'null');
  const userId = userStorage?.id;
  const { name } = useParams();

  useEffect(() => {
    // Verifica se a URL contém "/watch"
    if (location.pathname.includes('/watch')) {
      setCourseWatch(true);
    } else {
      setCourseWatch(false);
    }
  }, [location.pathname]);

  useEffect(() => {
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
    getDataByUser();
  }, []);

  const quantityBanners = () => {
    let quantity = 0;
    if (totalBanners !== undefined) {
      for (let i = 0; i < totalBanners; i++) {
        quantity += quantity + i;
      }
    }

    return Array.from({ length: quantity }, (_, index) => (
      <Box key={index} bg={indexCurrent === index ? '#fafafa' : '#aaa'} w={2} h={1} rounded={10}></Box>
    ))
  }

  if (!context) {
    throw new Error('Context is not defined.')
  }

  const { bannerCourse } = context;
  const { colorPrimary } = useCourseProgress();

  return (
    <Box
      width="full"
      position={courseWatch ? 'static' : 'absolute'}
      top={0}
      px={{ base: 4, lg: courseWatch ? 0 : 8 }}
      pr={{ base: 0, lg: 24 }}
      style={{ zIndex: 999 }}
    >
      <Flex
        justifyContent="space-between"
        alignItems="start"
        flexDirection={{ base: 'column', md: 'row' }}
        backdropFilter="blur(1px)"
      >
        <Flex
          flexDirection="column"
          gap={6}
          w="100%"
        >
          {/* Logo */}
          <Flex
            bg="#212B36"
            alignItems="center"
            gap={3}
            rounded={8}
            mt={{ base: 20, md: 6 }}
            pr={3}
            pl={1}
            w={{ base: '60%', md: '50%' }}
          >
            <Image
              src="/Rectangle 558.png"
              alt="Logo"
              w={{ base: "8", md: "10" }}
              h={{ base: "8", md: "10" }}
              objectFit="fill"
            />
            <Text>Logo do cliente</Text>
          </Flex>

          {!courseWatch && (
            <Flex
              alignItems="center"
              cursor="pointer"
              gap={3}
              w="100%"
              onClick={() => navigate('/courses')}
            >
              <FaArrowLeft fontSize={22} />
              <Text fontSize={18}>Voltar</Text>
            </Flex>
          )}

          {!courseWatch && (
            <>
              <Flex
                alignItems="center"
                gap={1}
                ml={2}
              >
                {quantityBanners()}
              </Flex>

              <Flex flexDirection="column" gap={6} justifyContent="space-between">
                {title !== undefined || description !== undefined ? (
                  <>
                    <Text fontSize={34}>
                      {title || ''}
                    </Text>
                    <Text>
                      {description || ''}
                    </Text>
                  </>
                ) : null}

                <ButtonGroup mt={{ base: 3, md: 5, lg: 10 }}>
                  <Button
                    bg={bannerCourse[0]?.botaoBannerCurso[0]?.cor}
                    _hover={{
                      bg: `${bannerCourse[0]?.botaoBannerCurso[0]?.cor}`
                    }}
                    color="white"
                  >
                    <a href={bannerCourse[0]?.botaoBannerCurso[0]?.link || '#'}>{bannerCourse[0]?.botaoBannerCurso[0]?.titulo || ''}</a>
                  </Button>

                  <Button
                    bg={bannerCourse[0]?.botaoBannerCurso[0]?.cor}
                    color="white"
                    _hover={{
                      bg: `${bannerCourse[0]?.botaoBannerCurso[0]?.cor}`
                    }}
                  >
                    <a href={bannerCourse[0]?.botaoBannerCurso[1]?.link || '#'}>{bannerCourse[0]?.botaoBannerCurso[1]?.titulo || ''}</a>
                  </Button>
                </ButtonGroup>
              </Flex>
            </>
          )}
        </Flex>

        {/* Links de navegação */}
        <Flex
          gap={6}
          height={{ base: '', md: '20' }}
          alignItems="center"
          justifyContent="start"
          mt={1}
          w="100%"
          position={{ base: 'absolute', md: 'static' }} // Absolute em mobile, estático em telas maiores
          top={4}
          left={{ base: 0, lg: 6 }}
        >
          <Text fontSize="lg" cursor="pointer" fontWeight="thin" color="gray.100" borderBottom={name !== undefined ? "2px" : "0"} borderColor={name !== undefined ? colorPrimary : ''} onClick={() => navigate(`/courses/`)}>
            Início
          </Text>
          <Text fontSize="lg" cursor="pointer" fontWeight="thin" color="gray.100">
            Comunidade
          </Text>
          <Text fontSize="lg" cursor="pointer" fontWeight="thin" color="gray.100">
            Links
          </Text>
        </Flex>

        {/* Avatar e Input de pesquisa */}
        <Flex
          alignItems="end"
          flexDirection="column"
          gap={6}
          mt={{ base: 1, md: 4 }}
          mr={{ base: 0, md: -40 }}
          position={{ base: 'absolute', md: 'static' }}
          right={{ base: 0, md: 4 }}
        >
          <HStack mr={{ base: 0, lg: 6 }} spacing={{ base: 4, md: 6 }}>
            {/* <ToggleThemeButton /> */}
            <Menu>
              <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
                <HStack>
                  <Avatar size="md" color="white" name={dataUser?.email} src={dataUser?.photoProfile || ''} />
                  <VStack
                    display={{ base: 'none', md: 'flex' }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2"
                    minW="60px"
                  />
                </HStack>
              </MenuButton>
              <MenuList zIndex={999}>
                <Box px={3} pb={3} pt={1}>
                  <Text fontSize="lg" fontWeight="thin" color="gray.100">
                    {dataUser?.nome}
                  </Text>
                </Box>
                <Box px={3} pb={3} pt={1}>
                  <Text fontSize="sm" fontWeight="thin" color="gray.500">
                    {dataUser?.email}
                  </Text>
                </Box>
                <Divider borderStyle="dashed" />
                <Stack pt={2}>
                  <MenuItem onClick={() => navigate('/courses')} fontSize="sm">
                    Página Inicial
                  </MenuItem>
                </Stack>
                <Stack pt={2}>
                  <MenuItem onClick={() => navigate('')} fontSize="sm">
                    Minha conta
                  </MenuItem>
                </Stack>
                <Stack pt={2}>
                  <MenuItem onClick={() => navigate('')} fontSize="sm">
                    Minhas compras
                  </MenuItem>
                </Stack>
                <Stack pt={2}>
                  <MenuItem onClick={() => navigate('')} fontSize="sm">
                    Central de ajuda
                  </MenuItem>
                </Stack>
                <Divider borderStyle="dashed" />
                <Stack pt={2}>
                  <MenuItem onClick={() => {
                    localStorage.removeItem('@dataCakto');
                    navigate('/')
                  }} fontSize="sm">
                    Logout
                  </MenuItem>
                </Stack>
              </MenuList>
            </Menu>
          </HStack>

          {!courseWatch && (
            <HStack w={200} mr={20} display={{ base: 'none', md: 'block' }}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
                <Input
                  placeholder="Pesquisar"
                  backgroundColor="#212B36"
                  border="none"
                  focusBorderColor="transparent"
                  _focus={{ boxShadow: 'none' }}
                  value={search}
                  onChange={(e) => setSearch?.(e.target.value) || ''}
                />
              </InputGroup>
            </HStack>
          )}
        </Flex>
      </Flex>
    </Box >
  );
};

export default Header;
