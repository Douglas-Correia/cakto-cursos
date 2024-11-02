import { ChatIcon } from "@chakra-ui/icons";
import { Avatar, Box, Flex, Text, VStack } from "@chakra-ui/react";

export function Comments() {
    return (
        <Box
            bg="#333e49"
            p={4}
            rounded="xl"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            color="white"
        >
            {/* Comentário Principal */}
            <Flex w="100%" alignItems="center">
                <Avatar size="md" bg="black" color="white" name="DD" src="" mr={3} />
                <VStack spacing={1} align="start" w="full">
                    <Text fontWeight="bold" color="white">Nome do usuário</Text>
                    <Text fontSize="sm" color="gray.300" mt={1}>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nam repellendus officiis amet quisquam delectus
                        autem eius natus fugit necessitatibus? Cum, aperiam facilis. Fuga quam error pariatur saepe? Deserunt, illo quis!
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt={2}>20/10/2024 17:00</Text>
                </VStack>
            </Flex>
            <Flex w="100%" justifyContent="flex-end" mt={2} alignItems="center">
                <Text mr={1} fontSize="sm" color="gray.300">10</Text>
                <ChatIcon color="gray.300" />
            </Flex>

            {/* Subcomentários */}
            <Box
                bg="#2b343e"
                p={3}
                mt={2}
                ml={10}
                rounded="md"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                color="white"
            >
                <Flex w="100%" alignItems="center">
                    <Avatar size="sm" bg="gray.700" color="white" name="AB" src="" mr={3} />
                    <VStack spacing={1} align="start" w="full">
                        <Text fontWeight="bold" fontSize="sm" color="white">Nome do subcomentário</Text>
                        <Text fontSize="xs" color="gray.300" mt={1}>
                            Esse é um subcomentário ao comentário principal, proporcionando uma resposta ou discussão adicional.
                        </Text>
                        <Text fontSize="xs" color="gray.400" mt={1}>20/10/2024 17:30</Text>
                    </VStack>
                </Flex>
            </Box>
        </Box>
    )
}