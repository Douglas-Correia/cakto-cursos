import { useCourseWatch } from '@/features/course/contexts/CourseWatchContext';
import { usePandaPlayer } from '@/features/course/contexts/VideoPlayerContext';
import { Icon } from '@chakra-ui/icons';
import { AspectRatio, Box, Center, Skeleton } from '@chakra-ui/react';
import { useEffect } from 'react';
import { FaPlay } from 'react-icons/fa';

type Props = {
  url: string;
};

const PandaVideoPlayer: React.FC<Props> = ({ url }) => {
  const { current, next, isFetching } = useCourseWatch();

  const { player, setProgress, duration, setDuration, setSeconds } = usePandaPlayer();

  if (isFetching) {
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

  const reset = () => {
    player.current?.contentWindow?.postMessage({ message: 'currentTime', parameter: 0 }, '*');
    setProgress(0);
  };

  const onEnd = () => {
    next();
    setProgress(0);
  };

  useEffect(() => {
    if (current.lesson) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.lesson]);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const { data } = event;

      if (data.message === 'panda_allData') {
        setDuration(data.playerData.duration);
      }

      if (data.message === 'panda_timeupdate') {
        const seconds = data.currentTime as number;
        setProgress((seconds / (duration || 1)) * 100);
        setSeconds(seconds);
      }

      if (data.message === 'panda_ended') {
        onEnd();
      }
    });

    return () => {
      window.removeEventListener('message', () => {});
    };
  }, []);

  return (
    <AspectRatio
      ratio={16 / 9}
      w="full"
      overflow="hidden"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="background"
      cursor="pointer"
      rounded="xl"
    >
      <iframe ref={player} src={url} allowFullScreen style={{ width: '100%', height: '100%' }} />
    </AspectRatio>
  );
};

export default PandaVideoPlayer;
