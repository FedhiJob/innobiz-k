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

export const InkLoader = ({ message = "Loading...", size = "md", className = "" }: InkLoaderProps) => {
  return (
    <div className={`ink-loader ${className}`.trim()}>
      <div className="ink-loader-card">
        <img
          alt="InnoBiz-K Ethiopia"
          className={`ink-logo-image ${sizeClass[size]}`}
          src="/ink-logo.png"
        />
      </div>
      <p className="ink-loader-text">{message}</p>
    </div>
  );
};
