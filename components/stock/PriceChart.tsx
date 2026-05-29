export default function PriceChart() {
  return (
    <div className="w-full h-[300px] relative border-b border-l border-card-border mt-2 rounded-bl-sm">
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line
          x1="0"
          x2="100"
          y1="25"
          y2="25"
          stroke="var(--card-border)"
          strokeDasharray="2,2"
          strokeOpacity="0.5"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          x2="100"
          y1="50"
          y2="50"
          stroke="var(--card-border)"
          strokeDasharray="2,2"
          strokeOpacity="0.5"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          x2="100"
          y1="75"
          y2="75"
          stroke="var(--card-border)"
          strokeDasharray="2,2"
          strokeOpacity="0.5"
          strokeWidth="0.5"
        />
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 80 Q 20 60, 40 70 T 80 40 L 100 20 L 100 100 L 0 100 Z"
          fill="url(#chartGradient)"
        />
        <path
          d="M0 80 Q 20 60, 40 70 T 80 40 L 100 20"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="100"
          cy="20"
          r="2"
          fill="var(--primary)"
          stroke="var(--card-bg)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
