import Image from "next/image";

type InkLoaderProps = {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "ink-logo-sm",
  md: "ink-logo-md",
  lg: "ink-logo-lg",
};

const sizeProps = {
  sm: { width: 40, height: 40 },
  md: { width: 64, height: 64 },
  lg: { width: 96, height: 96 },
};

export const InkLoader = ({ message = "Loading...", size = "md", className = "" }: InkLoaderProps) => {
  return (
    <div className={`ink-loader ${className}`.trim()}>
      <div className="ink-loader-card">
        <Image
          alt="innobiz-k Ethiopia"
          className={`ink-logo-image ${sizeClass[size]}`}
          src="/ink-logo.png"
          width={sizeProps[size].width}
          height={sizeProps[size].height}
          priority
        />
      </div>
      <p className="ink-loader-text">{message}</p>
    </div>
  );
};
