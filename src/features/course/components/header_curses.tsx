import { BellIcon } from "@chakra-ui/icons";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { Avatar, Box, Divider, Flex, HStack, Menu, MenuButton, MenuItem, MenuList, Stack, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { GetUserProps } from "../types/userStorage";
import { useNavigate } from "react-router-dom";

interface HeaderCursesProps {
  dataUser: GetUserProps | null
}

export function HeaderCurses({ dataUser }: HeaderCursesProps) {
  const [theme, setTheme] = useState('dark');
  const { toggleColorMode } = useColorMode();
  const { revoke, user } = useAuth();
  const navigate = useNavigate();

  return (
    <HStack
      w="full"
      px={{
        base: 5,
        md: 20,
      }}
    >
      <Flex
        w="full"
        alignItems="end"
        flexDirection="column"
        gap={6}
        mt={{ base: 4, md: 10 }}
      >
        <HStack
          spacing={{ base: 4, md: 6 }}
        >
          <Flex
            w={16}
            bgColor="#919EAB"
            rounded="3xl"
            cursor="pointer"
            justifyContent={theme === 'dark' ? 'flex-end' : 'flex-start'}
            onClick={() => {
              toggleColorMode();
              if (theme === 'dark') {
                setTheme('light');
              } else {
                setTheme('dark');
              }
            }}
          >
            <IconButton
              _hover={{
                bg: '#212B36'
              }}
              rounded="full"
              variant="ghost"
              aria-label="Toggle Theme"
              bg="#212B36"
              size="sm"
              icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
            />
          </Flex>
          <BellIcon fontSize={26} />
          <Menu>
            <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar size="md" color="white" name={user?.email} src={dataUser?.photoProfile || ''} />
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
      </Flex>
    </HStack>
  )
}