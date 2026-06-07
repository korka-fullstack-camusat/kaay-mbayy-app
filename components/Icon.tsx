import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.6 }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return <Svg {...props}><Path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z" /></Svg>;
    case 'map':
      return <Svg {...props}><Path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><Path d="M9 4v14M15 6v14" /></Svg>;
    case 'bell':
      return <Svg {...props}><Path d="M6 16l-2 2h16l-2-2V11a6 6 0 0 0-12 0z" /><Path d="M10 19a2 2 0 0 0 4 0" /></Svg>;
    case 'cart':
      return <Svg {...props}><Path d="M3 4h2l2 12h11l2-8H7" /><Circle cx={9} cy={20} r={1.4} /><Circle cx={17} cy={20} r={1.4} /></Svg>;
    case 'camera':
      return <Svg {...props}><Path d="M4 8h3l2-2h6l2 2h3v11H4z" /><Circle cx={12} cy={13} r={3.5} /></Svg>;
    case 'leaf':
      return <Svg {...props}><Path d="M5 19c8 0 14-6 14-14-7 0-13 3-13 10v4z" /><Path d="M5 19l9-9" /></Svg>;
    case 'sun':
      return <Svg {...props}><Circle cx={12} cy={12} r={4} /><Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></Svg>;
    case 'cloud':
      return <Svg {...props}><Path d="M7 18a4 4 0 0 1 .5-7.95A6 6 0 0 1 19 11.5 3.5 3.5 0 0 1 18 18z" /></Svg>;
    case 'drop':
      return <Svg {...props}><Path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></Svg>;
    case 'check':
      return <Svg {...props}><Path d="M5 12l5 5L20 7" /></Svg>;
    case 'arrow':
      return <Svg {...props}><Path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
    case 'arrow-left':
      return <Svg {...props}><Path d="M19 12H5M11 6l-6 6 6 6" /></Svg>;
    case 'arrow-up':
      return <Svg {...props}><Path d="M12 19V5M5 12l7-7 7 7" /></Svg>;
    case 'plus':
      return <Svg {...props}><Path d="M12 5v14M5 12h14" /></Svg>;
    case 'minus':
      return <Svg {...props}><Path d="M5 12h14" /></Svg>;
    case 'close':
      return <Svg {...props}><Path d="M6 6l12 12M18 6L6 18" /></Svg>;
    case 'search':
      return <Svg {...props}><Circle cx={11} cy={11} r={7} /><Path d="M21 21l-4.5-4.5" /></Svg>;
    case 'star':
      return <Svg {...props}><Path d="M12 3l2.7 6 6.3.6-4.8 4.2 1.5 6.2L12 16.8 6.3 20l1.5-6.2L3 9.6 9.3 9z" /></Svg>;
    case 'pin':
      return <Svg {...props}><Path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z" /><Circle cx={12} cy={9} r={2.5} /></Svg>;
    case 'sparkle':
      return <Svg {...props}><Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></Svg>;
    case 'flame':
      return <Svg {...props}><Path d="M12 3c1 3 5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4-1 4 3 3 3 1 0-2-1-3 0-6z" /></Svg>;
    case 'phone':
      return <Svg {...props}><Path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Svg>;
    case 'user':
      return <Svg {...props}><Circle cx={12} cy={8} r={4} /><Path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></Svg>;
    case 'logout':
      return <Svg {...props}><Path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M9 16l-5-4 5-4M4 12h12" /></Svg>;
    case 'lock':
      return <Svg {...props}><Rect x={4.5} y={11} width={15} height={10} rx={2} /><Path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>;
    case 'eye':
      return <Svg {...props}><Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><Circle cx={12} cy={12} r={3} /></Svg>;
    case 'eye-off':
      return <Svg {...props}><Path d="M3 3l18 18M9.9 5.2A11 11 0 0 1 22 12c-.7 1.4-1.7 2.7-3 3.8M6 6.5C4.4 7.8 3 9.7 2 12c.6 1.2 2.8 7 10 7 1.5 0 2.9-.3 4.2-.8" /></Svg>;
    case 'trash':
      return <Svg {...props}><Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Svg>;
    case 'chevron-down':
      return <Svg {...props}><Path d="M6 9l6 6 6-6" /></Svg>;
    case 'chevron-up':
      return <Svg {...props}><Path d="M18 15l-6-6-6 6" /></Svg>;
    case 'store':
      return <Svg {...props}><Path d="M3 9l1-5h16l1 5" /><Path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><Path d="M5 9v11h14V9" /><Path d="M10 14h4v6h-4z" /></Svg>;
    case 'tag':
      return <Svg {...props}><Path d="M12 2H7a2 2 0 0 0-2 2v5l10 10a2 2 0 0 0 2.83 0l4.17-4.17a2 2 0 0 0 0-2.83z" /><Circle cx={9} cy={9} r={1.5} /></Svg>;
    default:
      return null;
  }
}
