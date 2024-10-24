export const extractPandaVideoUrl = (url: string) => {
  const regexPlayer = /player-(.*?)\.tv/;

  const [, playerId] = url.match(regexPlayer) || ['', '', ''];

  const regexVideo = /[?&]v=([^&]+)/;

  const [, videoId] = url.match(regexVideo) || ['', '', ''];

  return `https://b-${playerId}.tv.pandavideo.com.br/${videoId}/playlist.m3u8`;
};
