import React from 'react';

export function UreaBagGraphic({ className = '', style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%" className={className} style={style}>
      <defs>
        <linearGradient id="bagBodyUrea" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="12%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="bagTopSeamUrea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="30%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="leafGradUrea" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <filter id="bagShadowUrea" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.15" />
        </filter>
        <linearGradient id="creaseHighlightUrea" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.06" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <g filter="url(#bagShadowUrea)">
        <path d="M 36 28 Q 100 24 164 28 L 168 40 Q 100 36 32 40 Z" fill="url(#bagTopSeamUrea)" stroke="#94a3b8" strokeWidth="0.8" />
        <path d="M 35 34 Q 100 30 165 34" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3,2.5" fill="none" opacity="0.85" />
        <path d="M 35 37 Q 100 33 165 37" stroke="#475569" strokeWidth="0.8" strokeDasharray="3,2.5" fill="none" opacity="0.6" />
        <path d="M 32 40 C 24 95, 20 160, 26 210 C 28 218, 42 222, 100 222 C 158 222, 172 218, 174 210 C 180 160, 176 95, 168 40 Q 100 36 32 40 Z" fill="url(#bagBodyUrea)" stroke="#cbd5e1" strokeWidth="1" />
      </g>
      <path d="M 32 40 C 26 100, 22 170, 28 210 C 35 210, 45 160, 48 40 Z" fill="#000000" opacity="0.04" />
      <path d="M 168 40 C 174 100, 178 170, 172 210 C 165 210, 155 160, 152 40 Z" fill="#000000" opacity="0.05" />
      <path d="M 70 42 Q 100 40 130 42 C 135 120, 130 190, 125 218 Q 100 220 75 218 C 68 190, 65 120, 70 42 Z" fill="url(#creaseHighlightUrea)" />
      <path d="M 26 210 C 32 206, 42 214, 50 220 C 36 220, 28 216, 26 210 Z" fill="#94a3b8" opacity="0.4" />
      <path d="M 174 210 C 168 206, 158 214, 150 220 C 164 220, 172 216, 174 210 Z" fill="#94a3b8" opacity="0.4" />
      <rect x="52" y="58" width="96" height="4" rx="2" fill="#16a34a" opacity="0.8" />
      <text x="100" y="96" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="22" fontWeight="900" textAnchor="middle" fill="#0f172a" letterSpacing="1">UREA</text>
      <text x="100" y="114" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle" fill="#16a34a" letterSpacing="0.5">46% NITROGEN</text>
      <g transform="translate(86, 126) scale(0.95)">
        <path d="M 14 32 C 14 32, 2 24, 2 12 C 2 3, 14 0, 14 0 C 14 0, 26 3, 26 12 C 26 24, 14 32, 14 32 Z" fill="url(#leafGradUrea)" />
        <path d="M 14 26 C 14 26, 26 22, 30 14 C 33 8, 28 3, 25 3 C 20 8, 16 16, 14 26 Z" fill="#15803d" opacity="0.85" />
        <path d="M 14 30 L 14 4" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <path d="M 14 18 Q 8 14 5 10" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
        <path d="M 14 14 Q 20 10 23 7" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
      </g>
      <g transform="translate(68, 172)">
        <rect x="0" y="0" width="64" height="16" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.7" />
        <text x="32" y="11.5" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="8" fontWeight="700" textAnchor="middle" fill="#475569">PREMIUM GRADE</text>
      </g>
      <path d="M 38 214 Q 100 216 162 214" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
    </svg>
  );
}

export function NPKBagGraphic({ className = '', style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%" className={className} style={style}>
      <defs>
        <linearGradient id="npkBagBodyInline" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="12%" stopColor="#f0fdf4" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#bbf7d0" />
        </linearGradient>
        <linearGradient id="npkBagTopInline" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="npkBadgeGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="npkShadowInline" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.15" />
        </filter>
      </defs>
      <g filter="url(#npkShadowInline)">
        <path d="M 36 28 Q 100 24 164 28 L 168 40 Q 100 36 32 40 Z" fill="url(#npkBagTopInline)" stroke="#15803d" strokeWidth="0.8" />
        <path d="M 35 34 Q 100 30 165 34" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3,2.5" fill="none" opacity="0.9" />
        <path d="M 32 40 C 24 95, 20 160, 26 210 C 28 218, 42 222, 100 222 C 158 222, 172 218, 174 210 C 180 160, 176 95, 168 40 Q 100 36 32 40 Z" fill="url(#npkBagBodyInline)" stroke="#86efac" strokeWidth="1.2" />
      </g>
      <rect x="52" y="56" width="96" height="4" rx="2" fill="#16a34a" opacity="0.9" />
      <text x="100" y="88" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="18" fontWeight="900" textAnchor="middle" fill="#0f172a" letterSpacing="1">NPK 19:19:19</text>
      <text x="100" y="106" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="11" fontWeight="800" textAnchor="middle" fill="#16a34a" letterSpacing="0.5">BALANCED FERTIGATION</text>
      <g transform="translate(60, 118)">
        <rect x="0" y="0" width="80" height="42" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1" />
        <text x="40" y="16" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="10" fontWeight="800" textAnchor="middle" fill="#15803d">100% SOLUBLE</text>
        <text x="40" y="32" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="9" fontWeight="600" textAnchor="middle" fill="#475569">MID-STAGE FLOWERING</text>
      </g>
      <g transform="translate(68, 174)">
        <rect x="0" y="0" width="64" height="16" rx="8" fill="url(#npkBadgeGradInline)" />
        <text x="32" y="11.5" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="8.5" fontWeight="800" textAnchor="middle" fill="#ffffff">UGA TARGET OPTIMAL</text>
      </g>
      <path d="M 38 214 Q 100 216 162 214" stroke="#86efac" strokeWidth="1" strokeDasharray="2,2" />
    </svg>
  );
}

export function PotassiumBagGraphic({ className = '', style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%" className={className} style={style}>
      <defs>
        <linearGradient id="kBagBodyInline" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="12%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="kBagTopSeamInline" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="30%" stopColor="#fed7aa" />
          <stop offset="70%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="kLogoGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <filter id="kBagShadowInline" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.15" />
        </filter>
      </defs>
      <g filter="url(#kBagShadowInline)">
        <path d="M 36 28 Q 100 24 164 28 L 168 40 Q 100 36 32 40 Z" fill="url(#kBagTopSeamInline)" stroke="#cbd5e1" strokeWidth="0.8" />
        <path d="M 35 34 Q 100 30 165 34" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3,2.5" fill="none" opacity="0.85" />
        <path d="M 32 40 C 24 95, 20 160, 26 210 C 28 218, 42 222, 100 222 C 158 222, 172 218, 174 210 C 180 160, 176 95, 168 40 Q 100 36 32 40 Z" fill="url(#kBagBodyInline)" stroke="#cbd5e1" strokeWidth="1" />
      </g>
      <rect x="52" y="58" width="96" height="4" rx="2" fill="#ea580c" opacity="0.8" />
      <text x="100" y="93" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="16" fontWeight="900" textAnchor="middle" fill="#0f172a" letterSpacing="0.5">NPK 13-0-45</text>
      <text x="100" y="110" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle" fill="#ea580c" letterSpacing="0.3">POTASSIUM NITRATE</text>
      <g transform="translate(86, 122) scale(0.95)">
        <circle cx="14" cy="18" r="14" fill="url(#kLogoGradInline)" />
        <path d="M 14 4 C 14 4, 11 0, 8 2 C 11 5, 14 6, 14 6 C 14 6, 17 5, 20 2 C 17 0, 14 4, 14 4 Z" fill="#22c55e" />
        <path d="M 14 6 L 14 1" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g transform="translate(68, 172)">
        <rect x="0" y="0" width="64" height="16" rx="8" fill="#fff7ed" stroke="#fed7aa" strokeWidth="0.7" />
        <text x="32" y="11.5" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="8" fontWeight="700" textAnchor="middle" fill="#c2410c">FRUIT EXPANSION</text>
      </g>
    </svg>
  );
}

export function CopperShieldGraphic({ className = '', style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%" className={className} style={style}>
      <defs>
        <linearGradient id="shieldBgInline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
        <linearGradient id="copperBottleInline" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="25%" stopColor="#f0f9ff" />
          <stop offset="70%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <filter id="shieldShadowInline" x="-10%" y="-5%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0c4a6e" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter="url(#shieldShadowInline)">
        <path d="M 40 35 Q 100 20 160 35 C 165 110, 150 180, 100 220 C 50 180, 35 110, 40 35 Z" fill="url(#shieldBgInline)" stroke="#38bdf8" strokeWidth="2" />
      </g>
      <path d="M 50 45 Q 100 34 150 45 C 154 105, 142 165, 100 204 C 58 165, 46 105, 50 45 Z" fill="#082f49" opacity="0.6" stroke="#0ea5e9" strokeWidth="1" />
      <g transform="translate(68, 60)">
        <rect x="18" y="0" width="28" height="12" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        <path d="M 14 12 L 50 12 L 58 28 L 6 28 Z" fill="url(#copperBottleInline)" stroke="#0284c7" strokeWidth="1" />
        <rect x="6" y="28" width="52" height="70" rx="8" fill="url(#copperBottleInline)" stroke="#0284c7" strokeWidth="1" />
        <rect x="12" y="44" width="40" height="38" rx="4" fill="#0284c7" />
        <text x="32" y="58" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="8" fontWeight="900" textAnchor="middle" fill="#ffffff">COPPER</text>
        <text x="32" y="70" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="7.5" fontWeight="700" textAnchor="middle" fill="#bae6fd">50% WP</text>
      </g>
      <text x="100" y="190" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="11" fontWeight="900" textAnchor="middle" fill="#bae6fd" letterSpacing="0.5">SPORE SHIELD</text>
      <text x="100" y="204" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="#38bdf8">RAIN DELAY ACTIVE</text>
    </svg>
  );
}

export function SSPBagGraphic({ className = '', style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%" className={className} style={style}>
      <defs>
        <linearGradient id="sspBodyInline" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="12%" stopColor="#fffbeb" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="sspTopInline" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path d="M 36 28 Q 100 24 164 28 L 168 40 Q 100 36 32 40 Z" fill="url(#sspTopInline)" stroke="#d97706" strokeWidth="0.8" />
      <path d="M 32 40 C 24 95, 20 160, 26 210 C 28 218, 42 222, 100 222 C 158 222, 172 218, 174 210 C 180 160, 176 95, 168 40 Q 100 36 32 40 Z" fill="url(#sspBodyInline)" stroke="#fcd34d" strokeWidth="1.2" />
      <rect x="52" y="56" width="96" height="4" rx="2" fill="#d97706" opacity="0.9" />
      <text x="100" y="88" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="18" fontWeight="900" textAnchor="middle" fill="#78350f">SSP 16% P₂O₅</text>
      <text x="100" y="106" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="11" fontWeight="800" textAnchor="middle" fill="#d97706">SUPER PHOSPHATE</text>
      <g transform="translate(60, 118)">
        <rect x="0" y="0" width="80" height="42" rx="8" fill="#fffbeb" stroke="#fcd34d" strokeWidth="1" />
        <text x="40" y="16" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="10" fontWeight="800" textAnchor="middle" fill="#b45309">ROOT VIGOR</text>
        <text x="40" y="32" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="9" fontWeight="600" textAnchor="middle" fill="#78350f">+ 11% SULPHUR</text>
      </g>
      <path d="M 38 214 Q 100 216 162 214" stroke="#fcd34d" strokeWidth="1" strokeDasharray="2,2" />
    </svg>
  );
}

export function CompostGraphic({ className = '', style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" width="100%" height="100%" className={className} style={style}>
      <defs>
        <linearGradient id="skyGradInline" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="60%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="treesGradInline" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="soilGroundInline" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d4b996" />
          <stop offset="30%" stopColor="#c29b68" />
          <stop offset="100%" stopColor="#a27b4e" />
        </linearGradient>
        <radialGradient id="compostCoreInline" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#452714" />
          <stop offset="40%" stopColor="#2c1810" />
          <stop offset="85%" stopColor="#1c0f0a" />
          <stop offset="100%" stopColor="#120906" />
        </radialGradient>
        <linearGradient id="compostLightInline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5a3825" />
          <stop offset="50%" stopColor="#3b2014" />
          <stop offset="100%" stopColor="#1e0f08" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" rx="8" fill="#f8fafc" />
      <g clipPath="url(#compostClipInline)">
        <clipPath id="compostClipInline">
          <rect width="200" height="160" rx="8" />
        </clipPath>
        <rect x="0" y="0" width="200" height="70" fill="url(#skyGradInline)" />
        <path d="M 20 20 Q 30 10 45 18 Q 60 12 75 22 Q 50 28 20 20 Z" fill="#ffffff" opacity="0.6" />
        <path d="M 130 15 Q 145 8 160 14 Q 175 10 185 20 Q 160 25 130 15 Z" fill="#ffffff" opacity="0.5" />
        <path d="M 0 55 Q 20 40 40 50 Q 65 35 90 48 Q 115 36 140 46 Q 170 38 200 50 L 200 80 L 0 80 Z" fill="url(#treesGradInline)" />
        <path d="M 0 60 Q 30 50 60 58 Q 100 48 135 56 Q 170 52 200 62 L 200 80 L 0 80 Z" fill="#4ade80" opacity="0.4" />
        <rect x="0" y="75" width="200" height="85" fill="url(#soilGroundInline)" />
        <ellipse cx="100" cy="128" rx="86" ry="18" fill="#1c0f0a" opacity="0.55" />
        <path d="M 12 128 C 18 105, 45 78, 75 66 C 90 60, 110 60, 125 66 C 155 78, 182 105, 188 128 C 180 138, 135 142, 100 142 C 65 142, 20 138, 12 128 Z" fill="url(#compostCoreInline)" />
        <path d="M 75 66 C 85 62, 115 62, 125 66 C 145 78, 160 95, 170 115 C 145 105, 120 100, 95 104 C 65 108, 40 118, 30 115 C 40 95, 55 78, 75 66 Z" fill="url(#compostLightInline)" />
        <circle cx="82" cy="74" r="1.2" fill="#ca8a04" opacity="0.7" />
        <circle cx="122" cy="85" r="1.5" fill="#ca8a04" opacity="0.6" />
        <circle cx="95" cy="110" r="1.3" fill="#a16207" opacity="0.7" />
      </g>
    </svg>
  );
}

export function BananaExtractGraphic({ className = '', style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" width="100%" height="100%" className={className} style={style}>
      <defs>
        <linearGradient id="bioBgInline" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="extractLiquidInline" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="35%" stopColor="#92400e" />
          <stop offset="70%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="bananaGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="ashGradInline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" rx="8" fill="#fffbeb" />
      <g clipPath="url(#bioClipInline)">
        <clipPath id="bioClipInline">
          <rect width="200" height="160" rx="8" />
        </clipPath>
        <circle cx="100" cy="140" r="95" fill="url(#bioBgInline)" opacity="0.6" />
        <path d="M 0 135 Q 100 130 200 135 L 200 160 L 0 160 Z" fill="#78350f" opacity="0.15" />
        <g transform="translate(18, 92)">
          <path d="M 0 42 C 6 22, 24 10, 42 10 C 60 10, 78 22, 84 42 Z" fill="url(#ashGradInline)" />
          <circle cx="36" cy="24" r="2" fill="#94a3b8" />
          <circle cx="48" cy="28" r="2.5" fill="#cbd5e1" />
          <circle cx="28" cy="34" r="1.5" fill="#94a3b8" />
          <circle cx="58" cy="36" r="2" fill="#cbd5e1" />
          <rect x="18" y="28" width="48" height="11" rx="4" fill="#1e293b" opacity="0.85" />
          <text x="42" y="36.5" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="7.5" fontWeight="800" textAnchor="middle" fill="#f8fafc">WOOD ASH</text>
        </g>
        <g transform="translate(108, 30)">
          <rect x="22" y="0" width="18" height="8" rx="2" fill="#a16207" stroke="#78350f" strokeWidth="0.8" />
          <rect x="26" y="8" width="10" height="6" fill="#ca8a04" />
          <path d="M 24 14 L 38 14 C 48 18, 56 26, 56 36 L 56 94 C 56 100, 50 104, 31 104 C 12 104, 6 100, 6 94 L 6 36 C 6 26, 14 18, 24 14 Z" 
                fill="url(#extractLiquidInline)" stroke="#78350f" strokeWidth="1" />
          <path d="M 12 36 L 12 92" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <rect x="10" y="44" width="42" height="38" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
          <circle cx="31" cy="56" r="8" fill="#ea580c" />
          <text x="31" y="60" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10" fontWeight="900" textAnchor="middle" fill="#ffffff">K+</text>
          <text x="31" y="71" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="6" fontWeight="800" textAnchor="middle" fill="#78350f">POTASSIUM</text>
          <text x="31" y="78" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="5.5" fontWeight="700" textAnchor="middle" fill="#16a34a">BIO-EXTRACT</text>
        </g>
        <g transform="translate(62, 90)">
          <path d="M 10 32 C 18 14, 42 12, 54 26 C 46 22, 26 24, 18 36 Z" fill="url(#bananaGradInline)" />
          <path d="M 18 36 C 28 20, 52 18, 68 34 C 54 28, 34 32, 24 44 Z" fill="#eab308" />
        </g>
      </g>
    </svg>
  );
}

export function TrichodermaGraphic({ className = '', style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" width="100%" height="100%" className={className} style={style}>
      <defs>
        <linearGradient id="trichoBgInline" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#dcfce7" />
          <stop offset="100%" stopColor="#bbf7d0" />
        </linearGradient>
        <linearGradient id="bottleGreenInline" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" rx="8" fill="#f0fdf4" />
      <circle cx="100" cy="80" r="65" fill="url(#trichoBgInline)" opacity="0.7" />
      <g transform="translate(70, 20)">
        <rect x="18" y="0" width="24" height="10" rx="3" fill="#15803d" />
        <path d="M 14 10 L 46 10 L 54 26 L 6 26 Z" fill="url(#bottleGreenInline)" />
        <rect x="6" y="26" width="48" height="74" rx="8" fill="url(#bottleGreenInline)" />
        <rect x="10" y="42" width="40" height="42" rx="4" fill="#ffffff" />
        <text x="30" y="58" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="7" fontWeight="900" textAnchor="middle" fill="#166534">TRICHODERMA</text>
        <text x="30" y="70" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="#15803d">BIO-FUNGICIDE</text>
        <text x="30" y="78" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="5.5" fontWeight="800" textAnchor="middle" fill="#0284c7">+ NEEM OIL</text>
      </g>
    </svg>
  );
}

export default function FertilizerGraphic({ type = 'urea', className = '', style = {} }) {
  const norm = (type || '').toLowerCase();
  if (norm.includes('npk') || norm.includes('19:19') || norm.includes('balanced')) {
    return <NPKBagGraphic className={className} style={style} />;
  }
  if (norm.includes('copper') || norm.includes('shield') || norm.includes('fungicide')) {
    return <CopperShieldGraphic className={className} style={style} />;
  }
  if (norm.includes('potassium') || norm.includes('nitrate') || norm.includes('13:0') || norm.includes('13-0')) {
    return <PotassiumBagGraphic className={className} style={style} />;
  }
  if (norm.includes('ssp') || norm.includes('phosphate') || norm.includes('phosphorus')) {
    return <SSPBagGraphic className={className} style={style} />;
  }
  if (norm.includes('banana') || norm.includes('woodash') || norm.includes('ash') || norm.includes('extract')) {
    return <BananaExtractGraphic className={className} style={style} />;
  }
  if (norm.includes('tricho') || norm.includes('neem') || norm.includes('spore')) {
    return <TrichodermaGraphic className={className} style={style} />;
  }
  if (norm.includes('compost') || norm.includes('fym') || norm.includes('manure') || norm.includes('organic')) {
    return <CompostGraphic className={className} style={style} />;
  }
  return <UreaBagGraphic className={className} style={style} />;
}
