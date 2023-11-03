import { PropsWithChildren, ReactNode, useMemo } from 'react';
import { VideoContext, useVideo, calculateProgress } from '../contexts';

const Segment = ({ children, start = 0, duration, render, override = true, cut = true }:
  PropsWithChildren<{
    start?: number, duration?: number, render?: (a: ReturnType<typeof useVideo>) => ReactNode, override?: boolean, cut?: boolean
}>) => {
  const videoContext = useVideo();

  const { currentFrame, getFrameTime } = videoContext;

  const currentFrameRelative = currentFrame - start;
  const currentTimeRelative = getFrameTime(currentFrameRelative);

  const segmentDurationFrames = duration != null ? duration : videoContext.durationFrames - start;
  const segmentDurationTime = getFrameTime(segmentDurationFrames);

  const segmentProgress = calculateProgress(currentFrameRelative, segmentDurationFrames);

  // Override the existing video context
  const videoContextNew = useMemo(() => ({
    ...videoContext,

    // Override these values:
    currentFrame: currentFrameRelative,
    currentTime: currentTimeRelative,
    durationFrames: segmentDurationFrames,
    durationTime: segmentDurationTime,
    progress: segmentProgress,
  }), [currentFrameRelative, currentTimeRelative, segmentDurationFrames, segmentDurationTime, videoContext, segmentProgress]);

  if (cut && (currentFrame < start || (duration != null && currentFrame >= start + duration))) return null;

  if (override) {
    return (
      <VideoContext.Provider value={videoContextNew}>
        {render && render(videoContextNew)}
        {children}
      </VideoContext.Provider>
    );
  }

  return (
    <>
      {render && render(videoContextNew)}
      {children}
    </>
  );
};

export default Segment;
