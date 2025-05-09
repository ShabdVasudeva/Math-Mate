
import { Calculator } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';

export function Header() {
  return (
    <header className="w-full bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Calculator className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold tracking-tight">MathMate</h1>
        </div>
        <ThemeToggleButton />
      </div>
    </header>
  );
}
