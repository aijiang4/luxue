import { useState } from 'react';
import { cn } from '@refly-packages/ai-workspace-common/utils/cn';

interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  aspectRatio?: string | number;
}

const BlurImage = ({
  src,
  alt,
  className,
  wrapperClassName,
  aspectRatio = '16/9',
  style,
  ...props
}: BlurImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const paddingBottom =
    typeof aspectRatio === 'string'
      ? `${(Number(aspectRatio.split('/')[1]) / Number(aspectRatio.split('/')[0])) * 100}%`
      : `${(1 / aspectRatio) * 100}%`;

  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-[12px]', wrapperClassName)}
      style={{
        paddingBottom,
      }}
    >
      {/* Blur placeholder */}
      <div
        className={cn(
          'absolute inset-0 rounded-[12px] bg-gray-200/50 backdrop-blur-lg transition-opacity duration-300',
          isLoading || hasError ? 'opacity-100' : 'opacity-0',
        )}
      >
        {/* Show loading spinner or error message */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span>Failed to load image</span>
          </div>
        )}
      </div>

      {/* Actual image */}
      <img
        src={src}
        alt={alt ?? ''}
        className={cn(
          'absolute inset-0 h-full w-full rounded-[12px] transition-opacity duration-300',
          isLoading || hasError ? 'opacity-0' : 'opacity-100',
          className,
        )}
        style={style}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
    </div>
  );
};

export default BlurImage;
