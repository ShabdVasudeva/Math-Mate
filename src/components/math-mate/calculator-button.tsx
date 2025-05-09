
"use client";
import type React from 'react';
import { Button } from '@/components/ui/button';

const sizeClasses = {
  default: 'text-lg sm:text-xl md:text-2xl h-16 sm:h-20',
  sm: 'text-sm sm:text-base md:text-lg h-12 sm:h-14 p-2', // Adjusted for smaller buttons
  lg: 'text-xl sm:text-2xl md:text-3xl h-20 sm:h-24',
  icon: 'h-10 w-10' // Default icon size from shadcn
};

export const CalculatorButton = ({
  onClick,
  label,
  className = '',
  variant = 'default',
  icon: Icon,
  size = 'default'
}: {
  onClick: () => void;
  label: string | React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "accent";
  icon?: React.ElementType;
  size?: keyof typeof sizeClasses;
}) => (
  <Button
    onClick={onClick}
    className={`transition-all duration-150 ease-in-out active:scale-95 ${sizeClasses[size]} ${className}`}
    variant={variant === "accent" ? "default" : variant} // shadcn Button doesn't have accent, map to default or handle custom
    style={variant === "accent" ? { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' } : {}}
    // Shadcn Button's size prop has specific values, if we use custom ones like 'sm' here,
    // it might not map directly. We apply h-* and text-* classes manually via sizeClasses.
    // So, pass 'default' or an appropriate shadcn size if needed for other Button internal styles.
    size={size === 'sm' || size === 'lg' ? 'default' : size} 
  >
    {Icon ? <Icon className="h-5 w-5 sm:h-6 sm:w-6" /> : label}
  </Button>
);

