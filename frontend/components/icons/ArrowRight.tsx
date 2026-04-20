export default function ArrowRight({ color, width = 38, height = 24, className = "" }: { color: string, width?: number, height?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 38 24" fill="none" className={className}>
            <g clipPath="url(#clip0_322_2253)">
                <path d="M22.4434 22.9327L22.4103 22.8987L32.7463 12.2647L22.4103 1.63166L22.4434 1.59766H27.626L38 12.2637L27.626 22.9307L22.4434 22.9327Z" fill="white"/>
                <path d="M0.500122 10.4883H32.8027V14.0433H0.500122V10.4883Z" fill={color}/>
            </g>
            <defs>
                <clipPath id="clip0_322_2253">
                <rect width="38" height="24" fill={color}/>
                </clipPath>
            </defs>
        </svg>
    )
}