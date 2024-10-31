// import { useCaktoPlayer } from '@/features/course/contexts/VideoPlayerContext';
// import { useMemo } from 'react';

// type PlaybackRate = {
//   label: string;
//   speed: number;
// };

// const PlaybackRates: PlaybackRate[] = [
//   { label: '0.5x', speed: 0.5 },
//   { label: '0.75x', speed: 0.75 },
//   { label: 'Normal', speed: 1 },
//   { label: '1.25x', speed: 1.25 },
//   { label: '1.5x', speed: 1.5 },
//   { label: '2x', speed: 2 },
// ];

// const useVideoPlaybackRate = () => {
//   const { player } = useCaktoPlayer();

//   const internalPlayer = player.current?.getInternalPlayer?.('hls');

//   const setPlaybackRate = (speed: number) => {
//     if (!internalPlayer) {
//       return;
//     }
//     internalPlayer!._media.playbackRate = speed;
//     internalPlayer!._media.defaultPlaybackRate = speed;
//     internalPlayer!._media.play();
//   };

//   const playbackRate = useMemo(
//     () => PlaybackRates.find(({ speed }) => speed === internalPlayer?._media?.playbackRate),
//     [internalPlayer?._media?.playbackRate]
//   );

//   return {
//     playbackRate,
//     setPlaybackRate,
//     PlaybackRates,
//   };
// };

// export { useVideoPlaybackRate };
