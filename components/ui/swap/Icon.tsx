import React from 'react';

import Swap from "../../../public/icons/swap.svg"
import SwapGradient from "../../../public/icons/swap-gradient.svg"

interface IIconProps {
  name: string;
  className?: string;
  size?: string;
  color?: 'white' | 'gray' | 'gradient' | 'danger' | 'success' | 'warning' | 'info';
}

interface IColorMapping {
  [key: string]: string;
}

interface ISizeMapping {
  [key: string]: string;
}

interface IIconMapping {
  [key: string]: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
}

const icons: IIconMapping = {
  swap: Swap,
  'swap-gradient': SwapGradient,
};

const colorMapping: IColorMapping = {
  white: 'is-white',
  gray: 'is-gray',
  gradient: 'is-gradient',
  danger: 'is-danger',
  success: 'is-success',
  warning: 'is-warning',
  info: 'is-info',
};

const sizeMapping: ISizeMapping = {
  small: 'is-small',
};

const Icon = ({ name, className = '', color = 'white', size = '' }: IIconProps) => {
  const iconName = color === 'gradient' ? `${name}-gradient` : name;
  const TheIcon = icons[iconName];
  
  const colorClasses = {
    white: 'fill-white',
    gray: 'fill-gray-500',
    gradient: 'fill-[linear-gradient(139.83deg,#f32fd7_0%,#3845fb_100%)]',
    danger: 'fill-red-500',
    success: 'fill-green-500',
    warning: 'fill-yellow-500',
    info: 'fill-blue-500'
  };

  return (
    <TheIcon 
      className={`
        inline-flex w-6 h-6 transition-colors duration-150
        ${size === 'small' ? 'w-5 h-5' : ''}
        ${colorClasses[color]}
        ${className}
      `} 
    />
  );
};

export default Icon;
