import { type ReactNode, useEffect, useState } from "react";
import { Spinner } from "@complete-web-app-boilerplate/ui/components/spinner";
import { BedDoubleIcon } from "lucide-react";

export function AuthVideo({ videoUrl }: { videoUrl: string }): ReactNode {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const shouldShow = media.matches;
      setShouldRenderVideo(shouldShow);
      if (!shouldShow) setIsVideoLoading(false);
      else setIsVideoLoading(true);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <>
      {shouldRenderVideo && (
        <div className="relative hidden bg-transparent md:block">
          {isVideoLoading && (
            <div className="bg-background/45 absolute inset-0 z-10 flex items-center justify-center">
              <Spinner />
            </div>
          )}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-80 dark:opacity-70"
            onLoadStart={() => setIsVideoLoading(true)}
            onWaiting={() => setIsVideoLoading(true)}
            onCanPlay={() => setIsVideoLoading(false)}
            onPlaying={() => setIsVideoLoading(false)}
            onStalled={() => setIsVideoLoading(true)}
            onError={() => setIsVideoLoading(false)}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {!isVideoLoading && (
            <>
              <div className="absolute inset-0 z-10 bg-black/25 backdrop-blur-[3px]" />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4">
                <div className="bg-background/35 flex size-16 items-center justify-center rounded-2xl border border-white/20 text-white shadow-lg backdrop-blur-md">
                  <BedDoubleIcon className="size-8" />
                </div>
                <div className="text-2xl font-extrabold">{import.meta.env.VITE_APP_NAME}</div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
