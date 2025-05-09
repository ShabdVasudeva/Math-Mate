
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Divide, X, Minus, Plus, Equal, Dot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { CalculatorButton } from './calculator-button';
import { PlusMinusIcon } from './plus-minus-icon';

export function BasicCalculatorSection() {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    setDisplayValue('0');
  }, []);

  const handleNumberClick = (numStr: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(numStr);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? numStr : displayValue + numStr);
    }
  };

  const handleDecimalClick = () => {
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleOperatorClick = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
      setOperator(nextOperator);
      return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation();
      if (result === null) return;
      setDisplayValue(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };
  
  const performCalculation = (): number | null => {
    if (firstOperand === null || operator === null) return null;
    const secondOperand = parseFloat(displayValue);
    let result: number | null = null;

    switch (operator) {
      case '+': result = firstOperand + secondOperand; break;
      case '-': result = firstOperand - secondOperand; break;
      case '*': result = firstOperand * secondOperand; break;
      case '/':
        if (secondOperand === 0) {
          toast({ title: "Error", description: "Cannot divide by zero.", variant: "destructive" });
          handleClear();
          return null;
        }
        result = firstOperand / secondOperand;
        break;
      default: return null;
    }
    return result !== null ? parseFloat(result.toPrecision(12)) : null;
  };

  const handleEqualsClick = () => {
    const result = performCalculation();
    if (result !== null) {
      setDisplayValue(String(result));
      setFirstOperand(result); 
      setOperator(null);
      setWaitingForSecondOperand(true); 
    } else if (firstOperand !== null && !operator) {
      setDisplayValue(String(firstOperand));
    }
  };

  const handleClear = () => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const handlePlusMinus = () => {
    setDisplayValue(String(parseFloat(displayValue) * -1));
  };

  const handlePercent = () => {
    setDisplayValue(String(parseFloat(displayValue) / 100));
  };
  
  const buttons = [
    { label: 'AC', onClick: handleClear, className: 'col-span-1', variant: 'destructive' as const },
    { label: <PlusMinusIcon />, onClick: handlePlusMinus, className: 'col-span-1', variant: 'secondary' as const },
    { label: <Percent />, onClick: handlePercent, className: 'col-span-1', variant: 'secondary' as const },
    { label: <Divide />, onClick: () => handleOperatorClick('/'), className: 'col-span-1', variant: 'accent' as const },

    { label: '7', onClick: () => handleNumberClick('7'), className: 'col-span-1' },
    { label: '8', onClick: () => handleNumberClick('8'), className: 'col-span-1' },
    { label: '9', onClick: () => handleNumberClick('9'), className: 'col-span-1' },
    { label: <X />, onClick: () => handleOperatorClick('*'), className: 'col-span-1', variant: 'accent' as const },
    
    { label: '4', onClick: () => handleNumberClick('4'), className: 'col-span-1' },
    { label: '5', onClick: () => handleNumberClick('5'), className: 'col-span-1' },
    { label: '6', onClick: () => handleNumberClick('6'), className: 'col-span-1' },
    { label: <Minus />, onClick: () => handleOperatorClick('-'), className: 'col-span-1', variant: 'accent' as const },

    { label: '1', onClick: () => handleNumberClick('1'), className: 'col-span-1' },
    { label: '2', onClick: () => handleNumberClick('2'), className: 'col-span-1' },
    { label: '3', onClick: () => handleNumberClick('3'), className: 'col-span-1' },
    { label: <Plus />, onClick: () => handleOperatorClick('+'), className: 'col-span-1', variant: 'accent' as const },
    
    { label: '0', onClick: () => handleNumberClick('0'), className: 'col-span-2' },
    { label: <Dot/>, onClick: handleDecimalClick, className: 'col-span-1' },
    { label: <Equal />, onClick: handleEqualsClick, className: 'col-span-1', variant: 'accent' as const },
  ];

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Arithmetic Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-lg mb-6 text-right">
          <p className="text-3xl sm:text-4xl md:text-5xl font-mono text-foreground break-all h-16 sm:h-20 flex items-center justify-end">{displayValue}</p>
        </div>
        <div className="grid grid-cols-4 grid-rows-5 gap-2">
          {buttons.map((btn, idx) => (
            <CalculatorButton
              key={idx}
              onClick={btn.onClick}
              label={btn.label}
              className={btn.className}
              variant={btn.variant || 'default'}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
