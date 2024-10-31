import { Box, Button, HStack, Image, Skeleton, Text, VStack } from "@chakra-ui/react";
import { FaDownload } from "react-icons/fa";

interface MaterialsProps {
  current?: any;
  isFetching?: boolean;
  mutateDownloadLessonFile?: any;
}

export function Materials({ current, mutateDownloadLessonFile }: MaterialsProps) {
  // const current = {
  //   lesson: {
  //     id: "lesson123",
  //     title: "Aula de sobrevivência",
  //     files: [
  //       "file-Como_encontrar_agua.pdf",
  //       "file-Construindo_um_abrigo.pdf",
  //       "file-Identificando_plantas_comestiveis.pdf"
  //     ]
  //   }
  // };

  const isFetching = false;

  return (
    <>
      {current?.lesson?.files?.length ? (
        <Skeleton isLoaded={!isFetching}>
          <Box maxWidth="100%" overflowX="auto">
            <HStack spacing={4} align="start">
              {current?.lesson?.files.map((file: any, index: any) => (
                <HStack
                  key={index}
                  flexDirection="row"
                  gap={2}
                  padding={3}
                  backgroundColor="#212B36"
                  rounded="lg"
                  minWidth="440px"
                  overflow="hidden"
                >
                  <HStack flexDirection="row" alignItems="center" gap={2}>
                    <Image src="../../../../public/icon-doc.png" />
                    <VStack align="start">
                      <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                        {file.replace(/^.*?-/, '')}
                      </Text>
                      <Text color="#919EAB">647.4kb</Text> {/* Tamanho fictício */}
                    </VStack>
                  </HStack>
                  <HStack ml="auto">
                    <Button
                      backgroundColor="#0F7864"
                      color="white"
                      leftIcon={<FaDownload />}
                      onClick={() =>
                        mutateDownloadLessonFile({
                          lessonId: current.lesson?.id || '',
                          fileKey: file,
                        })
                      }
                    >
                      Baixar
                    </Button>
                  </HStack>
                </HStack>
              ))}
            </HStack>
          </Box>
        </Skeleton>
      ) : null}
    </>
  );
}
