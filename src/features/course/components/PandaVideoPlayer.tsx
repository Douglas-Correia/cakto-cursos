import { Icon, SettingsIcon } from '@chakra-ui/icons';
import {
  AspectRatio,
  Box,
  Skeleton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  HStack,
  Center,
  Fade,
  VStack,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import React, { useState, useRef, useEffect, useContext } from 'react';
import { FaPlay, FaPause, FaExpand, FaCompress, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import Hls from 'hls.js';
import { GetUserProps } from '../types/userStorage';
import { api } from '../services/axios';
import { CourseWatchContext } from '../contexts/CourseWatchContext';

type Props = {
  url: string | undefined;
  thumbnail: string | undefined;
};

const PandaVideoPlayer: React.FC<Props> = ({ url, thumbnail }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.5); // Controle de volume
  const [isMuted, setIsMuted] = useState(false); // Controle de mudo
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false); // Controle de visibilidade do slider de volume
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const getUserStorage: GetUserProps = JSON.parse(localStorage.getItem('@dataCakto') ?? '{}');
  const context = useContext(CourseWatchContext);
  if (!context) {
    throw new Error('useCourseWatch must be used within a CourseWatchProvider');
  }

  const { courseWatchIds } = context;

  const { isOpen: isSpeedModalOpen, onToggle: toggleSpeedModal } = useDisclosure();

  useEffect(() => {
    if (url && playerRef.current) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(playerRef.current);

      // Escutando o evento `MANIFEST_PARSED` para ajustar a duração do vídeo
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (playerRef.current) {
          setDuration(playerRef.current.duration || 0);
        }
      });

      // Usar o evento `loadedmetadata` para garantir que a duração seja capturada corretamente
      playerRef.current.onloadedmetadata = () => {
        if (playerRef.current) {
          setDuration(playerRef.current.duration);
        }
      };

      return () => {
        hls.destroy();
      };
    }
  }, [url]);

  // Esse useEffect será executado quando o vídeo for carregado ou quando o tempo de início for definido
  // useEffect(() => {
  //   if (playerRef.current) {
  //     // Define o tempo inicial com base na API ou armazenamento
  //     playerRef.current.currentTime = 60 * 2;
  //   }
  // }, []);

  useEffect(() => {
    const times = {
      currentTime: currentTime.toFixed(0),
      duration: duration.toFixed(0),
    }
    sessionStorage.setItem('#currentTimesClasse', JSON.stringify(times));
  }, [currentTime]);

  useEffect(() => {
    const timesClasse = JSON.parse(sessionStorage.getItem('#currentTimesClasse') ?? '{}');
    const marcarAulaAssistida = async () => {
      try {
        await api.post(`/user/createMarcarAulaAssistidaByUser/${courseWatchIds?.classeId}`, {
          currentTime: timesClasse?.currentTime || '',
          duration: timesClasse?.duration || '',
        });
      } catch (error: any) {
        console.log(error);
      }
    }
    const interval = setInterval(marcarAulaAssistida, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleShowConfig = () => {
    setShowConfig(!showConfig);
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (playerRef.current) {
      playerRef.current.playbackRate = rate;
    }
    toggleSpeedModal(); // Fechar o modal após selecionar a velocidade
  };

  // Função para manipular o slider e atualizar o tempo
  const handleSliderChange = (value: number) => {
    if (playerRef.current) {
      // Garantir que o valor do slider esteja dentro dos limites (0 e duration)
      const newTime = Math.min(Math.max(value, 0), duration);
      playerRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Função para atualizar o tempo enquanto o vídeo está sendo reproduzido
  const handleTimeUpdate = () => {
    if (playerRef.current) {
      setCurrentTime(playerRef.current.currentTime);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      playerRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      setVolume(isMuted ? 0.5 : 0); // Ajusta o volume
    }
  };

  const toggleVolumeSlider = (param: boolean) => {
    setIsVolumeSliderVisible(param);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (playerRef.current) {
      playerRef.current.volume = value;
      setIsMuted(value === 0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const hexToRgba = (hex: string, alpha: number) => {
    // Remove o "#" caso exista
    hex = hex.replace("#", "");

    // Converte o hex em valores RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

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

  return (
    <Box w="full" position="relative">
      <AspectRatio ratio={16 / 9} w="full" rounded="xl">
        <video
          style={{ borderRadius: 12 }}
          ref={playerRef}
          poster={thumbnail}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          controls={false}
          onClick={handleShowConfig}
        >
          <source src={url} />
        </video>
      </AspectRatio>

      {showConfig && (
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          bg="rgba(0, 0, 0, 0.6)"
          color="white"
          p={3}
          pb={1}
          style={{ borderBottomRightRadius: 12, borderBottomLeftRadius: 12 }}
          display="flex"
          alignItems="center"
        >
          <HStack spacing={1} align="center">
            <Button variant="ghost" color="white" fontSize="md" _hover={{ backgroundColor: 'transparent' }} onClick={togglePlayPause}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </Button>
          </HStack>

          <HStack w="100%" position="relative">
            <Slider
              aria-label="video-progress"
              value={currentTime}
              min={0}
              max={duration}
              onChange={handleSliderChange}
              focusThumbOnChange={false}
              w="100%"
              mx={4}
            >
              <SliderTrack bg={hexToRgba(getUserStorage?.coresSystemUsuario?.corPrimaria, 0.25)}>
                <SliderFilledTrack bg={getUserStorage?.coresSystemUsuario?.corPrimaria} />
              </SliderTrack>
              <SliderThumb boxSize={3} />
            </Slider>

            <Text fontSize="sm" position="absolute" bottom={4} left={4}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </HStack>

          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            onMouseEnter={() => toggleVolumeSlider(true)}  // Exibe o slider quando o mouse entra
            onMouseLeave={() => toggleVolumeSlider(false)}
          >
            {/* Slider de volume */}
            {isVolumeSliderVisible && (
              <Box bg="" borderRadius="md" p={2}>
                <Slider
                  aria-label="volume-control"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={handleVolumeChange}
                  width="60px"
                  focusThumbOnChange={false}
                >
                  <SliderTrack bg={hexToRgba(getUserStorage?.coresSystemUsuario?.corPrimaria, 0.25)}>
                    <SliderFilledTrack bg={getUserStorage?.coresSystemUsuario?.corPrimaria} />
                  </SliderTrack>
                  <SliderThumb boxSize={3} />
                </Slider>
              </Box>
            )}

            {/* Botão de Volume */}
            <Button
              variant="ghost"
              color="white"
              fontSize="lg"
              _hover={{ backgroundColor: 'transparent' }}
              onClick={toggleMute}  // Alterna entre mudo e não mudo
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </Button>
          </Box>

          <Button variant="ghost" color="white" fontSize="md" _hover={{ backgroundColor: 'transparent' }} onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </Button>

          <Button
            variant="ghost"
            color="white"
            _hover={{ backgroundColor: 'transparent' }}
            fontSize="md"
            opacity={isSpeedModalOpen ? 0 : 1}
            onClick={toggleSpeedModal}
          >
            <SettingsIcon />
          </Button>

          {isSpeedModalOpen && (
            <Fade in={isSpeedModalOpen}>
              <VStack
                position="absolute"
                bottom="20%"
                right={0}
                bg="blackAlpha.700"
                borderRadius="md"
                spacing={1}
                zIndex={2}
              >
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <Button
                    key={rate}
                    variant="ghost"
                    color={playbackRate === rate ? getUserStorage?.coresSystemUsuario?.corPrimaria : 'white'}
                    fontSize="sm"
                    _hover={{ backgroundColor: 'transparent' }}
                    onClick={() => changePlaybackRate(rate)}
                  >
                    {rate}x
                  </Button>
                ))}
              </VStack>
            </Fade>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PandaVideoPlayer;
