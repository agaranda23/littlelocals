export function getDistanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Illustrated scene SVGs for each activity type — gives visual character without needing real photos
export const sceneIllustrations = {
  "Messy Play": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <defs><radialGradient id="mp1" cx="30%" cy="40%"><stop offset="0%" stopColor="#E1BEE7"/><stop offset="100%" stopColor="#CE93D8" stopOpacity="0.3"/></radialGradient></defs>
      <circle cx={w*0.2} cy={h*0.6} r={h*0.22} fill="#FF6B6B" opacity="0.25"/>
      <circle cx={w*0.7} cy={h*0.4} r={h*0.28} fill="#7B68EE" opacity="0.2"/>
      <circle cx={w*0.45} cy={h*0.75} r={h*0.18} fill="#FFD54F" opacity="0.3"/>
      <circle cx={w*0.85} cy={h*0.7} r={h*0.15} fill="#2EC4B6" opacity="0.25"/>
      {[...Array(8)].map((_,i) => <circle key={i} cx={w*(0.1+Math.random()*0.8)} cy={h*(0.1+Math.random()*0.8)} r={3+Math.random()*6} fill={["#FF6B6B","#7B68EE","#FFD54F","#2EC4B6","#FF9800"][i%5]} opacity={0.4+Math.random()*0.3}/>)}
      <text x={w*0.5} y={h*0.38} textAnchor="middle" fontSize={h*0.22} opacity="0.15" fill="#7B68EE">✋</text>
      <text x={w*0.25} y={h*0.65} textAnchor="middle" fontSize={h*0.14} opacity="0.2" fill="#FF6B6B">💧</text>
      <text x={w*0.78} y={h*0.58} textAnchor="middle" fontSize={h*0.14} opacity="0.2" fill="#FFD54F">⭐</text>
    </svg>
  ),
  "Soft Play": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <rect x={w*0.05} y={h*0.55} width={w*0.9} height={h*0.4} rx="20" fill="#2EC4B6" opacity="0.12"/>
      <circle cx={w*0.25} cy={h*0.62} r={h*0.12} fill="#FF6B6B" opacity="0.2"/>
      <circle cx={w*0.5} cy={h*0.58} r={h*0.14} fill="#42A5F5" opacity="0.2"/>
      <circle cx={w*0.75} cy={h*0.64} r={h*0.11} fill="#FFD54F" opacity="0.25"/>
      <circle cx={w*0.38} cy={h*0.72} r={h*0.09} fill="#66BB6A" opacity="0.2"/>
      <rect x={w*0.1} y={h*0.2} width={w*0.15} height={h*0.35} rx="8" fill="#00897B" opacity="0.1"/>
      <rect x={w*0.65} y={h*0.15} width={w*0.2} height={h*0.4} rx="8" fill="#00897B" opacity="0.08"/>
      <path d={`M${w*0.3} ${h*0.2} Q${w*0.5} ${h*0.05} ${w*0.65} ${h*0.25}`} stroke="#2EC4B6" strokeWidth="3" fill="none" opacity="0.15"/>
    </svg>
  ),
  "Playgroup": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <circle cx={w*0.3} cy={h*0.5} r={h*0.18} fill="#FF9800" opacity="0.15"/>
      <circle cx={w*0.5} cy={h*0.45} r={h*0.2} fill="#E65100" opacity="0.1"/>
      <circle cx={w*0.7} cy={h*0.52} r={h*0.16} fill="#FFB74D" opacity="0.18"/>
      <rect x={w*0.15} y={h*0.7} width={w*0.12} height={h*0.08} rx="4" fill="#FF9800" opacity="0.2"/>
      <rect x={w*0.35} y={h*0.68} width={w*0.1} height={h*0.1} rx="4" fill="#E65100" opacity="0.15"/>
      <rect x={w*0.55} y={h*0.72} width={w*0.14} height={h*0.06} rx="4" fill="#FFB74D" opacity="0.2"/>
      <text x={w*0.2} y={h*0.4} fontSize={h*0.12} opacity="0.18">🧸</text>
      <text x={w*0.6} y={h*0.35} fontSize={h*0.1} opacity="0.15">🎈</text>
    </svg>
  ),
  "Story Time": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <rect x={w*0.2} y={h*0.25} width={w*0.35} height={h*0.45} rx="4" fill="#F48FB1" opacity="0.12" transform={`rotate(-8 ${w*0.37} ${h*0.47})`}/>
      <rect x={w*0.25} y={h*0.28} width={w*0.35} height={h*0.45} rx="4" fill="#C62828" opacity="0.1" transform={`rotate(5 ${w*0.42} ${h*0.5})`}/>
      <text x={w*0.65} y={h*0.3} fontSize={h*0.12} opacity="0.2">⭐</text>
      <text x={w*0.15} y={h*0.8} fontSize={h*0.1} opacity="0.15">✨</text>
      <text x={w*0.75} y={h*0.7} fontSize={h*0.1} opacity="0.15">🌙</text>
      {[...Array(5)].map((_,i) => <circle key={i} cx={w*(0.55+i*0.08)} cy={h*(0.6+Math.sin(i)*0.1)} r="2" fill="#FFD54F" opacity="0.3"/>)}
    </svg>
  ),
  "Outdoor": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <rect x="0" y={h*0.65} width={w} height={h*0.35} fill="#66BB6A" opacity="0.12" rx="0"/>
      <ellipse cx={w*0.3} cy={h*0.65} rx={w*0.25} ry={h*0.12} fill="#4CAF50" opacity="0.1"/>
      <ellipse cx={w*0.75} cy={h*0.63} rx={w*0.2} ry={h*0.1} fill="#81C784" opacity="0.12"/>
      <line x1={w*0.2} y1={h*0.65} x2={w*0.2} y2={h*0.25} stroke="#8D6E63" strokeWidth="4" opacity="0.15"/>
      <circle cx={w*0.2} cy={h*0.25} r={h*0.18} fill="#66BB6A" opacity="0.15"/>
      <line x1={w*0.7} y1={h*0.63} x2={w*0.7} y2={h*0.3} stroke="#8D6E63" strokeWidth="3" opacity="0.12"/>
      <circle cx={w*0.7} cy={h*0.32} r={h*0.14} fill="#81C784" opacity="0.12"/>
      <circle cx={w*0.85} cy={h*0.15} r={h*0.1} fill="#FFD54F" opacity="0.2"/>
      <text x={w*0.5} y={h*0.55} textAnchor="middle" fontSize={h*0.08} opacity="0.12">🦆</text>
    </svg>
  ),
  "Music": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      {[...Array(5)].map((_,i) => <circle key={i} cx={w*(0.15+i*0.18)} cy={h*(0.3+Math.sin(i*1.2)*0.15)} r={h*0.06+i*2} fill={["#FFD54F","#FF9800","#FFB74D","#FFF176","#FFE082"][i]} opacity="0.25"/>)}
      <text x={w*0.15} y={h*0.7} fontSize={h*0.12} opacity="0.15">♪</text>
      <text x={w*0.45} y={h*0.25} fontSize={h*0.14} opacity="0.12">♫</text>
      <text x={w*0.75} y={h*0.65} fontSize={h*0.1} opacity="0.15">♬</text>
      <path d={`M${w*0.1} ${h*0.8} Q${w*0.3} ${h*0.6} ${w*0.5} ${h*0.75} Q${w*0.7} ${h*0.9} ${w*0.9} ${h*0.7}`} stroke="#F57F17" strokeWidth="2" fill="none" opacity="0.12"/>
    </svg>
  ),
  "Performing Arts": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <rect x={w*0.1} y={h*0.1} width={w*0.05} height={h*0.6} fill="#B39DDB" opacity="0.15"/>
      <rect x={w*0.85} y={h*0.1} width={w*0.05} height={h*0.6} fill="#B39DDB" opacity="0.15"/>
      <path d={`M${w*0.1} ${h*0.1} Q${w*0.5} ${h*0.25} ${w*0.9} ${h*0.1}`} fill="#4527A0" opacity="0.08"/>
      <circle cx={w*0.5} cy={h*0.55} r={h*0.2} fill="#EDE7F6" opacity="0.2"/>
      <text x={w*0.35} y={h*0.5} fontSize={h*0.15} opacity="0.15">🎭</text>
      <text x={w*0.6} y={h*0.75} fontSize={h*0.08} opacity="0.12">⭐</text>
    </svg>
  ),
  "Sport": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <circle cx={w*0.35} cy={h*0.5} r={h*0.22} fill="#42A5F5" opacity="0.12" stroke="#1565C0" strokeWidth="2" strokeOpacity="0.1"/>
      <circle cx={w*0.65} cy={h*0.45} r={h*0.18} fill="#E3F2FD" opacity="0.2"/>
      <path d={`M${w*0.1} ${h*0.8} L${w*0.5} ${h*0.2} L${w*0.9} ${h*0.8}`} stroke="#42A5F5" strokeWidth="2" fill="none" opacity="0.1"/>
      <text x={w*0.5} y={h*0.7} textAnchor="middle" fontSize={h*0.1} opacity="0.15">⚡</text>
    </svg>
  ),
  "Baking": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <ellipse cx={w*0.5} cy={h*0.65} rx={w*0.3} ry={h*0.12} fill="#FF8A65" opacity="0.15"/>
      <rect x={w*0.3} y={h*0.35} width={w*0.4} height={h*0.3} rx="12" fill="#BF360C" opacity="0.08"/>
      <circle cx={w*0.4} cy={h*0.3} r={h*0.06} fill="#FFD54F" opacity="0.25"/>
      <circle cx={w*0.6} cy={h*0.28} r={h*0.05} fill="#FF8A65" opacity="0.2"/>
      <text x={w*0.2} y={h*0.45} fontSize={h*0.1} opacity="0.15">🧁</text>
      <text x={w*0.72} y={h*0.4} fontSize={h*0.08} opacity="0.12">🍪</text>
    </svg>
  ),
  "Arts & Crafts": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <circle cx={w*0.3} cy={h*0.4} r={h*0.2} fill="#CE93D8" opacity="0.15"/>
      <circle cx={w*0.6} cy={h*0.55} r={h*0.16} fill="#6A1B9A" opacity="0.08"/>
      <rect x={w*0.15} y={h*0.6} width={w*0.08} height={h*0.25} rx="3" fill="#FFD54F" opacity="0.2" transform={`rotate(-15 ${w*0.19} ${h*0.72})`}/>
      <rect x={w*0.7} y={h*0.3} width={w*0.06} height={h*0.3} rx="3" fill="#FF6B6B" opacity="0.15" transform={`rotate(10 ${w*0.73} ${h*0.45})`}/>
      <text x={w*0.5} y={h*0.35} textAnchor="middle" fontSize={h*0.12} opacity="0.15">🖌️</text>
    </svg>
  ),
  "Swimming": (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:"absolute",top:0,left:0}}>
      <path d={`M0 ${h*0.5} Q${w*0.15} ${h*0.4} ${w*0.3} ${h*0.5} Q${w*0.45} ${h*0.6} ${w*0.6} ${h*0.5} Q${w*0.75} ${h*0.4} ${w} ${h*0.5} L${w} ${h} L0 ${h} Z`} fill="#4FC3F7" opacity="0.12"/>
      <path d={`M0 ${h*0.6} Q${w*0.2} ${h*0.5} ${w*0.4} ${h*0.6} Q${w*0.6} ${h*0.7} ${w*0.8} ${h*0.6} Q${w*0.9} ${h*0.55} ${w} ${h*0.6} L${w} ${h} L0 ${h} Z`} fill="#0277BD" opacity="0.06"/>
      <circle cx={w*0.7} cy={h*0.3} r={h*0.04} fill="#4FC3F7" opacity="0.3"/>
      <circle cx={w*0.75} cy={h*0.35} r={h*0.03} fill="#4FC3F7" opacity="0.25"/>
      <circle cx={w*0.3} cy={h*0.38} r={h*0.035} fill="#4FC3F7" opacity="0.2"/>
    </svg>
  ),
};

// Brand mascot — the bear logo