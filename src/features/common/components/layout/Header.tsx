import { useAuth } from '@/features/auth/contexts/AuthContext';
import ToggleThemeButton from '@/features/common/components/theme/ToggleThemeButton';
import { SearchIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FlexProps,
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
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

type HeaderProps = FlexProps;

const Header = ({ ...rest }: HeaderProps) => {
  const { revoke, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Captura o objeto de localização
  const [courseWatch, setCourseWatch] = useState(false);

  useEffect(() => {
    // Verifica se a URL contém "/watch"
    if (location.pathname.includes('/watch')) {
      setCourseWatch(true);
    } else {
      setCourseWatch(false);
    }
  }, [location.pathname]);

  return (
    <Box
      width="100%"
      position="absolute"
      top={0}
      left={0}
      {...rest}
    >
      <Flex
        px={{ base: 4, md: 8 }}
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
            w={{ base: '50%', md: '50%' }}
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
                <Box bg="white" w={2} h={1} rounded={10}></Box>
                <Box bg="gray" w={1} h={1} rounded={10}></Box>
                <Box bg="gray" w={1} h={1} rounded={10}></Box>
              </Flex>

              <Flex flexDirection="column" gap={6}>
                <Text fontSize={34}>
                  Como sobreviver na floresta
                </Text>
                <Text>
                  Para sobreviver na floresta, é essencial encontrar água potável, construir um abrigo seguro e aprender a identificar plantas comestíveis.
                </Text>
                <ButtonGroup>
                  <Button
                    bg="transparent"
                    _hover={{
                      bg: "transparent"
                    }}
                    borderWidth={1}
                    borderColor="white"
                    color="white"
                  >
                    Botão personalizado
                  </Button>
                  <Button
                    bg="green"
                    color="white"
                    _hover={{
                      bg: "green"
                    }}
                  >
                    Botão personalizado
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
          left={6}
        >
          <Text fontSize="lg" fontWeight="thin" color="gray.100" borderBottom="2px" borderColor="green">
            Início
          </Text>
          <Text fontSize="lg" fontWeight="thin" color="gray.100">
            Comunidade
          </Text>
          <Text fontSize="lg" fontWeight="thin" color="gray.100">
            Links
          </Text>
        </Flex>

        {/* Avatar e Input de pesquisa */}
        <Flex
          alignItems="end"
          flexDirection="column"
          gap={6}
          mt={{ base: 1, md: 4 }}
          position={{ base: 'absolute', md: 'static' }}
          right={{ base: 4, md: 4 }}
        >
          <HStack spacing={{ base: 4, md: 6 }}>
            <ToggleThemeButton />
            <Menu>
              <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
                <HStack>
                  <Avatar size="md" color="white" name={user?.email} src="" />
                  <VStack
                    display={{ base: 'none', md: 'flex' }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2"
                    minW="60px"
                  />
                </HStack>
              </MenuButton>
              <MenuList>
                <Box px={3} pb={3} pt={1}>
                  <Text fontSize="lg" fontWeight="thin" color="gray.100">
                    Nome aluno
                  </Text>
                </Box>
                <Box px={3} pb={3} pt={1}>
                  <Text fontSize="sm" fontWeight="thin" color="gray.500">
                    {user?.email}
                  </Text>
                </Box>
                <Divider borderStyle="dashed" />
                <Stack pt={2}>
                  <MenuItem onClick={() => revoke()} fontSize="sm">
                    Página Inicial
                  </MenuItem>
                </Stack>
                <Stack pt={2}>
                  <MenuItem onClick={() => revoke()} fontSize="sm">
                    Minha conta
                  </MenuItem>
                </Stack>
                <Stack pt={2}>
                  <MenuItem onClick={() => revoke()} fontSize="sm">
                    Minhas compras
                  </MenuItem>
                </Stack>
                <Stack pt={2}>
                  <MenuItem onClick={() => revoke()} fontSize="sm">
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
            <HStack display={{ base: 'none', md: 'block' }}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
                <Input
                  placeholder="Pesquisar"
                  backgroundColor="#212B36"
                  border="none"
                  focusBorderColor="transparent"
                  _focus={{ boxShadow: 'none' }}
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
