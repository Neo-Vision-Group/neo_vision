"use client"

import { useState } from "react"

export default function TeamArrowRight({ width=36, height=36, color="#0F0F0F", disabled=false }: { width?: number; height?: number; color?: string; disabled?: boolean }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 36 24"
            fill="none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
                <path d="M23.8763 13.9803L25.3608 12.6195V11.3824L23.8763 9.89783L22.3918 8.62109L1.52588e-05 8.6211L5.76697 14.3881C6.44103 15.0621 7.26488 15.3617 8.16363 15.3617L22.3918 15.3617L23.8763 13.9803Z" style={{ fill: isHovered && !disabled ? "#FF4100" : color, transition: "fill 0.2s" }}/>
                <path d="M19.5174 19.2141L24.2837 23.9805L35.8817 12.3824L27.726 12.3824C26.7728 12.3824 25.9784 12.7531 25.3429 13.3886L19.5174 19.2141Z" style={{ fill: isHovered && !disabled ? "#FF4100" : color, transition: "fill 0.2s" }}/>
                <path d="M19.4948 4.76632L24.2612 0L35.8592 11.598L27.7035 11.598C26.7502 11.598 25.9559 11.2273 25.3204 10.5918L19.4948 4.76632Z" style={{ fill: isHovered && !disabled ? "#FF4100" : color, transition: "fill 0.2s" }}/>
        </svg>
    )
}