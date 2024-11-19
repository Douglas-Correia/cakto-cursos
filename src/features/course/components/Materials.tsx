import { Box, Button, HStack, Image, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { api } from "../services/axios";
import { MaterialsProps } from "../types/materials";
import { CourseWatchContext } from "../contexts/CourseWatchContext";

interface MaterialsFuncProps {
  aulaId: string | undefined;
  mutateDownloadLessonFile?: (params: { lessonId: string; fileKey: string }) => Promise<any>;
}

export function Materials({ aulaId, mutateDownloadLessonFile }: MaterialsFuncProps) {
  const [allMaterials, setAllMaterials] = useState<MaterialsProps[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const context = useContext(CourseWatchContext);

  if (!context) {
    throw new Error("Context is not defined.");
  }

  const { courseWatchIds } = context;

  useEffect(() => {
    const fetchAllMaterials = async () => {
      setIsFetching(true);
      try {
        const response = await api.get(`user/getAllArquivosAulaforUser/${aulaId}`);
        if (response.data) {
          setAllMaterials(response.data);
        }
      } catch (error: any) {
        console.log(error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchAllMaterials();
  }, [courseWatchIds?.classeId]);

  const downloadFile = async ({ lessonId, fileKey }: any) => {
    try {
      if (mutateDownloadLessonFile) {
        // Usa mutateDownloadLessonFile se estiver definida
        const response = await mutateDownloadLessonFile({ lessonId, fileKey });
        const blob = new Blob([response.data], { type: response.headers["content-type"] });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileKey; // Nome do arquivo
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback para baixar diretamente do link se mutateDownloadLessonFile for undefined
        const link = document.createElement("a");
        link.href = fileKey;
        link.download = fileKey.split("/").pop() || "download"; // Extrai o nome do arquivo da URL
        document.body.appendChild(link);
        link.click();

        link.remove();
      }
    } catch (error) {
      console.error("Erro ao baixar o arquivo:", error);
    }
  };

  return (
    <>
      {allMaterials.length ? (
        <Skeleton isLoaded={!isFetching}>
          <Box maxWidth="100%" overflowX="auto">
            <HStack spacing={4} align="start">
              {allMaterials.map((file, index) => (
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
                    <Image src="/icon-doc.png" />
                    <VStack align="start">
                      <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" color="white">
                        {file?.titulo}
                      </Text>
                      <Text color="#919EAB">{file?.fileSize}</Text>
                    </VStack>
                  </HStack>
                  <HStack ml="auto">
                    <Button
                      backgroundColor="#0F7864"
                      color="white"
                      leftIcon={<FaDownload />}
                      onClick={() =>
                        downloadFile({
                          lessonId: file?.id || "",
                          fileKey: file?.arquivo || "arquivo-desconhecido",
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
