import { Icon } from '@chakra-ui/icons';
import { AspectRatio, Box, Center, Skeleton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import ReactPlayer from 'react-player';

type Props = {
  url: string | undefined;
};

const PandaVideoPlayer: React.FC<Props> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);

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
    <AspectRatio ratio={16 / 9} w="full" rounded="xl">
      <ReactPlayer
        url={url}
        playing={isPlaying}
        controls
        width="100%"
        height="100%"
        style={{ borderRadius: 12 }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </AspectRatio>
  );
};

export default PandaVideoPlayer;
