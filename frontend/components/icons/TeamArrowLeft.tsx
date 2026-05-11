"use client"

import { useState } from "react"

export default function TeamArrowLeft({ width=36, height=36, color="#0F0F0F" }: { width?: number; height?: number; color?: string }) {
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
            <path d="M12.1239 13.9803L10.6394 12.6195V11.3824L12.1239 9.89783L13.6084 8.62109L36.0002 8.6211L30.2332 14.3881C29.5592 15.0621 28.7353 15.3617 27.8366 15.3617L13.6084 15.3617L12.1239 13.9803Z" style={{ fill: isHovered ? "#FF4100" : color, transition: "fill 0.2s" }}/>
            <path d="M16.4828 19.2141L11.7165 23.9805L0.11845 12.3824L8.27415 12.3824C9.22742 12.3824 10.0218 12.7531 10.6573 13.3886L16.4828 19.2141Z" style={{ fill: isHovered ? "#FF4100" : color, transition: "fill 0.2s" }}/>
            <path d="M16.5053 4.76632L11.739 0L0.140972 11.598L8.29668 11.598C9.24994 11.598 10.0443 11.2273 10.6798 10.5918L16.5053 4.76632Z" style={{ fill: isHovered ? "#FF4100" : color, transition: "fill 0.2s" }}/>
        </svg>
    )
}