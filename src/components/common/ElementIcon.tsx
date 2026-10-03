import React from 'react';
import { 
  Layout, 
  TrendingUp, 
  Sliders, 
  SquareDot, 
  Play, 
  CheckSquare, 
  Type, 
  Binary, 
  Circle, 
  Activity, 
  ArrowUpRight, 
  Compass, 
  Palette 
} from 'lucide-react';

export const ELEMENT_ICONS: Record<string, React.ComponentType<any>> = {
  'Elements.DrawingPanel': Layout,
  'Elements.PlottingPanel': TrendingUp,
  'Elements.Slider': Sliders,
  'Elements.Button': SquareDot,
  'Elements.TwoStateButton': Play,
  'Elements.CheckBox': CheckSquare,
  'Elements.Label': Type,
  'Elements.ParsedField': Binary,
  'Elements.Shape2D': Circle,
  'Elements.Spring2D': Activity, // waves/spring frequency
  'Elements.Arrow2D': ArrowUpRight,
  'Elements.Trail2D': Compass, // path trail
  'Elements.CustomDraw': Palette,
};

interface Props {
  type: string;
  className?: string;
}

export default function ElementIcon({ type, className = "w-4 h-4" }: Props) {
  const IconComp = ELEMENT_ICONS[type] || Circle;
  return <IconComp className={className} />;
}
