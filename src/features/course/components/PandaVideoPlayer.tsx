import { Icon } from '@chakra-ui/icons';
import { AspectRatio, Box, Center, Skeleton } from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import { FaPlay } from 'react-icons/fa';
import HlsPlayer from 'react-hls-player';
import '@/style.css';

type Props = {
  url: string | undefined;
};

const PandaVideoPlayer: React.FC<Props> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false); // Estado para controlar o playback
  const playerRef = useRef<HTMLVideoElement | null>(null); // Referência do player

  // Exibir o esqueleto de carregamento enquanto o vídeo não estiver carregado
  if (!url) {
    return (
      <Box padding="6" boxShadow="lg">
        <AspectRatio ratio={16 / 9}>
          <Box position="relative">
            <Skeleton width="100%" height="100%" />
            <Center position="absolute" top="0" left="0" right="0" bottom="0">
              <Icon as={FaPlay} boxSize={12} color="gray.500" />
            </Center>
          </Box>
        </AspectRatio>
      </Box>
    );
  }

  // Renderizar o player HLS com o react-hls-player
  return (
    <AspectRatio ratio={16 / 9} w="full" rounded="xl">
      <div className="w-full h-full">
        <HlsPlayer
          src={url} // Passar a URL do vídeo
          autoPlay={isPlaying} // Não iniciar automaticamente
          controls={true} // Ativar controles padrão
          playerRef={playerRef} // Passar a referência do player
          onPlay={() => setIsPlaying(true)} // Atualizar o estado quando o vídeo começar
          onPause={() => setIsPlaying(false)} // Atualizar o estado quando o vídeo for pausado
          onEnded={() => setIsPlaying(false)} // Atualizar o estado quando o vídeo terminar
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 12,
          }}
        />
        <style>{`
        /* Personalizar a cor da barra de volume */
        video::-webkit-media-controls-volume-slider {
        // background-color: #ff0000;  /* Cor da barra de volume */
      }

      /* Personalizar a cor da barra de progresso (timeline) */
      video::-webkit-media-controls-timeline {
        // background-color: red;  /* Cor da barra de progresso */
      }
      `}</style>
      </div>
    </AspectRatio>
  );
};

export default PandaVideoPlayer;