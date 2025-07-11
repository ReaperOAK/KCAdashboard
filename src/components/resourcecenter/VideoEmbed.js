import React from 'react';

const VideoEmbed = React.memo(function VideoEmbed({ url }) {
  let videoId = '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const regex = /(?:youtube.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    videoId = match ? match[1] : '';
  }
  if (videoId) {
    return (
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        ></iframe>
      </div>
    );
  }
  return <p className="text-gray-500">Video preview not available</p>;
});

export default VideoEmbed;
