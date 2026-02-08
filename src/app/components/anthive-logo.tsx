interface AntHiveLogoProps {
  className?: string;
  variant?: "full" | "icon";
}

export function AntHiveLogo({ className = "w-10 h-10", variant = "icon" }: AntHiveLogoProps) {
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Hexagon pattern (hive) */}
        <path
          d="M50 5 L80 25 L80 55 L50 75 L20 55 L20 25 Z"
          fill="url(#gradient1)"
          opacity="0.2"
        />
        <path
          d="M50 15 L72 28 L72 52 L50 65 L28 52 L28 28 Z"
          fill="url(#gradient1)"
          opacity="0.3"
        />
        
        {/* Ant silhouette in center */}
        {/* Ant body - three circles (head, thorax, abdomen) */}
        <circle cx="50" cy="35" r="6" fill="url(#gradient2)" />
        <ellipse cx="50" cy="45" rx="5" ry="6" fill="url(#gradient2)" />
        <ellipse cx="50" cy="56" rx="7" ry="9" fill="url(#gradient2)" />
        
        {/* Ant legs */}
        <path
          d="M45 43 L38 36 M55 43 L62 36"
          stroke="url(#gradient2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M45 48 L35 48 M55 48 L65 48"
          stroke="url(#gradient2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M45 53 L38 60 M55 53 L62 60"
          stroke="url(#gradient2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Ant antennae */}
        <path
          d="M47 32 L43 25 M53 32 L57 25"
          stroke="url(#gradient2)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Full logo with text
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Hexagon pattern (hive) */}
        <path
          d="M50 5 L80 25 L80 55 L50 75 L20 55 L20 25 Z"
          fill="url(#gradient1)"
          opacity="0.2"
        />
        <path
          d="M50 15 L72 28 L72 52 L50 65 L28 52 L28 28 Z"
          fill="url(#gradient1)"
          opacity="0.3"
        />
        
        {/* Ant silhouette in center */}
        <circle cx="50" cy="35" r="6" fill="url(#gradient2)" />
        <ellipse cx="50" cy="45" rx="5" ry="6" fill="url(#gradient2)" />
        <ellipse cx="50" cy="56" rx="7" ry="9" fill="url(#gradient2)" />
        
        {/* Ant legs */}
        <path
          d="M45 43 L38 36 M55 43 L62 36"
          stroke="url(#gradient2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M45 48 L35 48 M55 48 L65 48"
          stroke="url(#gradient2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M45 53 L38 60 M55 53 L62 60"
          stroke="url(#gradient2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Ant antennae */}
        <path
          d="M47 32 L43 25 M53 32 L57 25"
          stroke="url(#gradient2)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
