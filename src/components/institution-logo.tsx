interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function InstitutionLogo({ className = "", width = 80, height = 80 }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      width={width} 
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Círculo de fondo con gradiente mejorado */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      
      <circle cx="100" cy="100" r="95" fill="url(#bgGradient)" stroke="#1E40AF" strokeWidth="4"/>
      
      {/* Escudo principal - forma original */}
      <path d="M40 60 L160 60 L170 70 L170 160 L100 180 L30 160 L30 70 Z" 
            fill="#1E40AF" stroke="#FBBF24" strokeWidth="3"/>
      
      {/* Franja roja superior */}
      <rect x="35" y="65" width="130" height="25" fill="#DC2626"/>
      
      {/* Sección I - E */}
      <rect x="35" y="65" width="25" height="25" fill="#DC2626"/>
      <text x="47" y="82" fontSize="16" fontWeight="bold" fill="white">I</text>
      
      {/* Número 3024 */}
      <rect x="65" y="65" width="70" height="25" fill="white"/>
      <text x="100" y="82" fontSize="14" fontWeight="bold" fill="black" textAnchor="middle">3024</text>
      
      <rect x="140" y="65" width="25" height="25" fill="#DC2626"/>
      <text x="152" y="82" fontSize="16" fontWeight="bold" fill="white">E</text>
      
      {/* Letras JAE (José Antonio Encinas) */}
      <text x="100" y="115" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle">JAE</text>
      
      {/* Libro abierto */}
      <rect x="65" y="125" width="70" height="25" fill="white" stroke="#FBBF24" strokeWidth="2"/>
      <line x1="100" y1="125" x2="100" y2="150" stroke="#FBBF24" strokeWidth="2"/>
      
      {/* Texto del libro */}
      <text x="82" y="138" fontSize="8" fill="black" fontWeight="bold">HONRA-</text>
      <text x="82" y="146" fontSize="8" fill="black" fontWeight="bold">DEZ</text>
      <text x="82" y="154" fontSize="8" fill="black" fontWeight="bold">ESTUDIO</text>
      
      <text x="118" y="138" fontSize="8" fill="black" fontWeight="bold">DISCI-</text>
      <text x="118" y="146" fontSize="8" fill="black" fontWeight="bold">PLINA</text>
      <text x="118" y="154" fontSize="8" fill="black" fontWeight="bold">TRABAJO</text>
      
      {/* Banner José Antonio Encinas */}
      <path d="M60 155 L140 155 L145 165 L135 170 L65 170 L55 165 Z" 
            fill="#FBBF24" stroke="#1E40AF" strokeWidth="2"/>
      <text x="100" y="165" fontSize="10" fontWeight="bold" fill="black" textAnchor="middle">J.A. ENCINAS</text>
    </svg>
  )
}

export function InstitutionLogoMini({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      width={40} 
      height={40}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="18" fill="#0EA5E9" stroke="#1E40AF" strokeWidth="2"/>
      <text x="20" y="24" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">3024</text>
    </svg>
  )
}