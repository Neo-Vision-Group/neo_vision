/**
 * Arrow right icon — inlined from Figma asset
 * (fontisto:arrow-right, node 120:320). 38×24 native size, white fill
 * (controlled by currentColor via the fill variable override).
 */
export function ArrowRight({
  className,
  width = 38,
  height = 24,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 38 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M22.4434 22.933L22.4103 22.899L32.7463 12.265L22.4103 1.63202L22.4434 1.59802H27.626L38 12.264L27.626 22.931L22.4434 22.933Z" />
      <path d="M0.500151 10.488H32.8028V14.043H0.500151V10.488Z" />
    </svg>
  );
}
