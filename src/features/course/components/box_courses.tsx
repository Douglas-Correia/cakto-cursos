import { AspectRatio, Box, Card, Image, Text } from "@chakra-ui/react";

interface BoxCoursesProps {
    mouseEnter: () => void;
    mouseLeave: () => void;
    img: string;
    name: string;
    indexModulo: number | null;
    index: number;
    textBtn: string;
}

export function BoxCourses({
    mouseEnter,
    mouseLeave,
    img,
    name,
    indexModulo,
    index,
    textBtn,
}: BoxCoursesProps) {
    return (
        <Box w="364px">
            <AspectRatio ratio={12 / 10}>
                <Card
                    rounded="2xl"
                    overflow="hidden"
                    onMouseEnter={mouseEnter}
                    onMouseLeave={mouseLeave}
                >
                    {/* Imagem ajustada */}
                    <Image
                        src={img}
                        alt={`Imagem ${name}`}
                        objectFit="cover"
                        w="full"
                        h="full"
                    />

                    {/* Área do botão e texto sobre a imagem */}
                    <Box
                        position="absolute"
                        bottom="0"
                        left="0"
                        width="100%"
                        bg="#212B36"
                        color="white"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        p="4"
                    >
                        <Text fontWeight="bold" fontSize="xl" mb="2">
                            {name}
                        </Text>
                        <Box
                            opacity={indexModulo === index ? 1 : 0}
                            transition="opacity 0.6s ease-in-out"
                        >
                            {indexModulo === index && (
                                <Box
                                    as="button"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    gap={2}
                                    w="100%"
                                    h="40px"
                                    borderRadius="6"
                                    bg="green.500"
                                    color="white"
                                    fontSize={17}
                                    fontWeight="bold"
                                >
                                    {textBtn}
                                    <Image
                                        src="/play.png"
                                        alt="play"
                                    />
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Card>
            </AspectRatio>
        </Box>
    )
}