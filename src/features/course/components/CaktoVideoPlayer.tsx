import { useCourseWatch } from '@/features/course/contexts/CourseWatchContext';
import { useCaktoPlayer } from '@/features/course/contexts/VideoPlayerContext';
import { PlayerType } from '@/features/course/types';
import {
  AspectRatio,
  Box,
  Center,
  DarkMode,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
} from '@chakra-ui/react';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { FaExpand, FaPause, FaPlay } from 'react-icons/fa6';
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute, IoMdVolumeOff } from 'react-icons/io';
import { MdGraphicEq } from 'react-icons/md';
import { TbRewindBackward15, TbRewindForward15 } from 'react-icons/tb';
import ReactPlayer from 'react-player';
import VideoSettingsPopover from './VideoSettingsPopover';

enum Status {
  Idle,
  Playing,
  Paused,
}

const CaktoVideoPlayer = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { current, next, isFetching } = useCourseWatch();

  const {
    player,
    type,
    volume,
    setVolume,
    muted,
    progress,
    setProgress,
    setMuted,
    duration,
    setDuration,
    seconds,
    setSeconds,
  } = useCaktoPlayer();

  const [status, setStatus] = useState(Status.Idle);

  const fullscreen = useFullScreenHandle();

  const originalUrl = current.lesson?.video?.toString() || '';

  const videoUrl = useMemo(
    () => `${import.meta.env.VITE_VIDEO_STREAM_URL}/${originalUrl}/playlist.m3u8`,
    [originalUrl]
  );

  const thumbnail = current.lesson?.cover
    ? current.lesson.cover
    : `${import.meta.env.VITE_VIDEO_STREAM_URL}/${originalUrl}/thumbnail.jpg`;

  const VolumeIcon = useMemo(() => {
    if (muted) {
      return IoMdVolumeOff;
    }
    if (volume > 50) {
      return IoMdVolumeHigh;
    }
    if (volume > 20) {
      return IoMdVolumeLow;
    }
    return IoMdVolumeMute;
  }, [muted, volume]);

  const handleChangeSeconds = (value: number) => {
    setSeconds(value);
    setProgress((value / (duration || 1)) * 100);
  };

  const reset = () => {
    setProgress(0);
    setSeconds(0);
    setStatus(Status.Idle);
    player.current?.seekTo(0);
  };

  useEffect(() => {
    if (current.lesson) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.lesson]);

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

  if (current.lesson?.error) {
    return (
      <Box padding="6" boxShadow="lg">
        <AspectRatio ratio={16 / 9}>
          <Box
            flexDirection="column"
            justifyItems="center"
            alignItems="center"
            textAlign="center"
            gap={6}
          >
            <Image
              src="/green-text-logo-transparent-background-login.png"
              alt={'cakto logo'}
              w="200px"
              objectFit="contain"
            />

            <Box>
              <Text fontSize={['lg', 'xl', '2xl']} color="#008365">
                {current.lesson.error}
              </Text>
              <Text fontSize={['sm', 'md']}>
                A aula será liberada no dia{' '}
                {moment(current.lesson.releaseDate).format('D [de] MMMM [de] YYYY [as] HH:mm[.]')}
              </Text>
            </Box>
          </Box>
        </AspectRatio>
      </Box>
    );
  }

  if (!current.lesson?.video.length) {
    return null;
  }

  return (
    <FullScreen handle={fullscreen}>
      <Flex
        w="full"
        h="full"
        position="relative"
        rounded={fullscreen.active ? 'none' : 'xl'}
        overflow="hidden"
        ref={containerRef}
      >
        <AspectRatio
          id="player"
          ratio={16 / 9}
          w="full"
          overflow="hidden"
          display="flex"
          justifyContent="center"
          alignItems="center"
          bg="background"
          cursor="pointer"
          onClick={() => {
            if (videoUrl.length) {
              setStatus(status === Status.Playing ? Status.Paused : Status.Playing);
            }
          }}
          className="peer"
        >
          <ReactPlayer
            key={current.lesson?.id}
            ref={player}
            url={videoUrl}
            pip={false}
            controls={type === PlayerType.YOUTUBE}
            playIcon={
              <Icon
                as={FaPlay}
                fontSize={{
                  base: '3xl',
                  sm: '4xl',
                  lg: '7xl',
                }}
                color="white"
              />
            }
            width="100%"
            height="100%"
            playing={status === Status.Playing}
            volume={volume / 100}
            onPlay={() => {
              setStatus(Status.Playing);
            }}
            onPause={() => {
              setStatus(Status.Paused);
            }}
            onStart={() => {
              setStatus(Status.Playing);
            }}
            onClickPreview={() => {
              setStatus(Status.Playing);
            }}
            light={thumbnail}
            onEnded={() => {
              next();
              setProgress(0);
            }}
            onDuration={setDuration}
            progressInterval={100}
            onProgress={({ playedSeconds }) => {
              handleChangeSeconds(playedSeconds);
            }}
          />
        </AspectRatio>
        <DarkMode>
          <Box
            hidden={type !== PlayerType.CAKTO}
            id="controls"
            alignSelf="flex-end"
            w="full"
            position="absolute"
            bottom={0}
            bg={'rgba(0, 0, 0, 0.5)'}
            roundedBottom={fullscreen.active ? 'none' : 'xl'}
            pb={1}
            transition="opacity 0.3s"
            opacity={status === Status.Paused ? 1 : 0}
            _hover={{
              opacity: status === Status.Idle ? 0 : 1,
            }}
            _peerHover={{
              opacity: status === Status.Idle ? 0 : 1,
            }}
            style={{
              backdropFilter: 'blur(5px)',
            }}
          >
            <Stack position="relative" spacing={0}>
              <Slider
                size={{
                  base: 'sm',
                  sm: 'md',
                }}
                aria-label="progress"
                defaultValue={0}
                step={0.1}
                value={Math.max(Math.min(progress, 99), 1)}
                colorScheme="primary"
                onChange={(value) => {
                  const newSeconds = Math.round((value / 100) * duration);
                  player.current?.seekTo(newSeconds);
                  setProgress(value);
                }}
                p={0}
                mt={-2}
              >
                <SliderTrack bg="primary.100">
                  <SliderFilledTrack bg="primary.500" />
                </SliderTrack>
                <SliderThumb
                  boxSize={{
                    base: 3,
                    sm: 4,
                  }}
                >
                  <Box color="primary.500" as={MdGraphicEq} />
                </SliderThumb>
              </Slider>
              <HStack px={2} justify="space-between">
                <HStack gap={1}>
                  <IconButton
                    aria-label="play"
                    icon={
                      <Icon
                        as={status === Status.Playing ? FaPause : FaPlay}
                        color={'primary.300'}
                      />
                    }
                    colorScheme="primary"
                    size={{
                      base: 'xs',
                      sm: 'sm',
                    }}
                    variant="ghost"
                    onClick={() => {
                      setStatus(status === Status.Playing ? Status.Paused : Status.Playing);
                    }}
                  />
                  <IconButton
                    aria-label="volume"
                    icon={<Icon as={VolumeIcon} color={'primary.300'} />}
                    colorScheme="primary"
                    size={{
                      base: 'xs',
                      sm: 'sm',
                    }}
                    variant="ghost"
                    onClick={() => {
                      setMuted(!muted);
                      setVolume(muted ? 100 : 0);
                    }}
                  />
                  <Slider
                    mx={1}
                    size="sm"
                    aria-label="volume"
                    value={volume}
                    onChange={(value) => {
                      setVolume(value);
                      setMuted(value === 0);
                    }}
                    step={1}
                    colorScheme="primary"
                    p={0}
                    w={16}
                  >
                    <SliderTrack bg="primary.100">
                      <SliderFilledTrack bg="primary.300" />
                    </SliderTrack>
                    <SliderThumb boxSize={2} />
                  </Slider>

                  <Text fontSize="2xs" color="white" ml={2} noOfLines={1}>
                    {moment().startOf('day').seconds(seconds).format('mm:ss')}
                    {' / '}
                    {moment().startOf('day').seconds(duration).format('mm:ss')}
                  </Text>

                  <IconButton
                    aria-label="rewind-backward"
                    icon={<Icon as={TbRewindBackward15} color={'primary.300'} />}
                    colorScheme="primary"
                    size={{
                      base: 'xs',
                      sm: 'sm',
                    }}
                    variant="ghost"
                    onClick={() => {
                      const newSeconds = Math.max(seconds - 15, 0);
                      player.current?.seekTo(newSeconds);
                      handleChangeSeconds(newSeconds);
                    }}
                    display={{ base: 'none', sm: 'flex' }}
                  />

                  <IconButton
                    aria-label="rewind-forward"
                    icon={<Icon as={TbRewindForward15} color={'primary.300'} />}
                    colorScheme="primary"
                    size={{
                      base: 'xs',
                      sm: 'sm',
                    }}
                    variant="ghost"
                    onClick={() => {
                      const newSeconds = Math.min(seconds + 15, duration);
                      player.current?.seekTo(newSeconds);
                      handleChangeSeconds(newSeconds);
                    }}
                    display={{ base: 'none', sm: 'flex' }}
                  />
                </HStack>

                <HStack>
                  <VideoSettingsPopover />
                  <IconButton
                    aria-label="expand"
                    icon={<Icon as={FaExpand} color={'primary.300'} />}
                    colorScheme="primary"
                    size={{
                      base: 'xs',
                      sm: 'sm',
                    }}
                    variant="ghost"
                    onClick={() => {
                      fullscreen.active ? fullscreen.exit() : fullscreen.enter();
                    }}
                  />
                </HStack>
              </HStack>
            </Stack>
          </Box>
        </DarkMode>
      </Flex>
    </FullScreen>
  );
};

export default CaktoVideoPlayer;
