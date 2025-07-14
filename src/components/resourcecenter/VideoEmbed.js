
import React, { useMemo } from 'react';

/**
 * VideoEmbed: Beautiful, responsive, single-responsibility video embed
 * - Embeds YouTube video or shows fallback
 * - Responsive, color tokens, accessible, mobile friendly
 */
const VideoEmbed = React.memo(function VideoEmbed({ url }) {
  // Memoize videoId extraction for performance
  const videoId = useMemo(() => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regex = /(?:youtube.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : '';
    }
    return '';
  }, [url]);

  if (videoId) {
    return (
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-gray-light bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
          aria-label="YouTube video player"
        ></iframe>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-full aspect-[16/9] rounded-lg border border-gray-light bg-background-light">
      <span className="text-gray-dark/60 text-lg">Video preview not available</span>
    </div>
  );
});

export default VideoEmbed;
