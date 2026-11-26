import { LoadingSpinner } from "./loading-spinner";

export type FullscreenLoaderProps = {
  message?: string;
};

export function FullscreenLoader({ message }: FullscreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center backdrop-blur-xs">
      <div>
        <LoadingSpinner size="lg" className="my-10" />
      </div>
      {message && <div>{message}</div>}
    </div>
  );
}
