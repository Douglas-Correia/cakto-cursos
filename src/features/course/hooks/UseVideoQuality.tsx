import { useCaktoPlayer } from '@/features/course/contexts/VideoPlayerContext';

type VideoQuality = {
  label: string;
  hd: boolean;
};

const useVideoQuality = () => {
  const { player } = useCaktoPlayer();

  const internalPlayer = player.current?.getInternalPlayer?.('hls');

  const qualities = (internalPlayer?.levels?.map((level: { height: number }) => ({
    label: `${level.height}p`,
    hd: level.height >= 720,
  })) || []) as VideoQuality[];

  const changeQuality = (index: number) => {
    if (!internalPlayer) {
      return;
    }

    internalPlayer.currentLevel = index;
    internalPlayer!._media.play();
  };

  return {
    changeQuality,
    quality: internalPlayer?.currentLevel || 0,
    qualities,
  };
};

export { useVideoQuality };
