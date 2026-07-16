interface LogoProps {
  withWordmark?: boolean;
  size?: number;
  className?: string;
}

// A rounded mark with a checkmark reads as "leads getting closed" — the
// actual point of the product — rather than an arbitrary monogram.
export function Logo({ withWordmark = false, size = 32, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="yanivcrm-logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#yanivcrm-logo-gradient)" />
        <path
          d="M9.5 16.8 L13.7 21 L22.5 11.5"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {withWordmark && (
        <span className="text-base font-semibold text-gray-900">
          Yaniv<span className="text-blue-600">CRM</span>
        </span>
      )}
    </span>
  );
}
