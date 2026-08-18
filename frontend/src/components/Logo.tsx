export default function Logo({ className = '' }: { className?: string }) {
 return (
 <svg 
 viewBox="0 0 160 48" 
 fill="none" 
 xmlns="http://www.w3.org/2000/svg"
 className={className}
 >
 <defs>
 <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
 <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0000FF" floodOpacity="0.4" />
 </filter>
 <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="40">
 <stop offset="0%" stopColor="#0000FF" />
 <stop offset="100%" stopColor="#0000CC" />
 </linearGradient>
 </defs>

 <g filter="url(#logoGlow)">
 {/* Left accent line */}
 <rect x="8" y="8" width="2" height="32" fill="#80B3FF" />
 
 {/* Main Box */}
 <rect x="14" y="4" width="132" height="40" fill="url(#blueGrad)" />
 
 {/* Right accent line */}
 <rect x="150" y="8" width="2" height="32" fill="#80B3FF" />
 
 {/* Text */}
 <text 
 x="80" 
 y="26" 
 dominantBaseline="middle"
 textAnchor="middle"
 fontFamily="Outfit, system-ui, sans-serif" 
 fontWeight="900" 
 fontSize="26" 
 letterSpacing="0.05em"
 fill="white" 
 >
 FRESHCO
 </text>
 </g>
 </svg>
 );
}
