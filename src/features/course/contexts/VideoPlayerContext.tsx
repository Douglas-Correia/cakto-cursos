import { PlayerType } from '@/features/course/types';
import { PropsWithChildren, createContext, useContext, useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

type VideoPlayerContextType = {
  url: string;
  setUrl: (url: string) => void;
  player: React.RefObject<ReactPlayer | HTMLIFrameElement>;
  type: PlayerType;
  progress: number;
  setProgress: (progress: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  duration: number;
  setDuration: (duration: number) => void;
  seconds: number;
  setSeconds: (seconds: number) => void;
};

const VideoPlayerContext = createContext<VideoPlayerContextType>({} as VideoPlayerContextType);

const VideoPlayerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const player = useRef<ReactPlayer | HTMLIFrameElement>(null);

  const [url, setUrl] = useState('');

  const [progress, setProgress] = useState(0);

  const [seconds, setSeconds] = useState(0);

  const [volume, setVolume] = useState(1);

  const [muted, setMuted] = useState(false);

  const [duration, setDuration] = useState(0);

  const type = useMemo(() => {
    if (url.includes('panda')) {
      return PlayerType.PANDA;
    }
    if (url.includes('youtube')) {
      return PlayerType.YOUTUBE;
    }
    return PlayerType.CAKTO;
  }, [url]);

  return (
    <VideoPlayerContext.Provider
      value={{
        url,
        setUrl,
        player,
        type,
        progress,
        setProgress,
        volume,
        setVolume,
        muted,
        setMuted,
        duration,
        setDuration,
        seconds,
        setSeconds,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};

const useCaktoPlayer = () => {
  const context = useContext(VideoPlayerContext);

  if (!context) {
    throw new Error('useCaktoPlayer must be used within a VideoPlayerProvider');
  }

  return {
    ...context,
    player: context.player as React.RefObject<ReactPlayer>,
  };
};

const usePandaPlayer = () => {
  const context = useContext(VideoPlayerContext);

  if (!context) {
    throw new Error('usePandaPlayer must be used within a VideoPlayerProvider');
  }

  return {
    ...context,
    player: context.player as React.RefObject<HTMLIFrameElement>,
  };
};

export { VideoPlayerContext, VideoPlayerProvider, useCaktoPlayer, usePandaPlayer };
