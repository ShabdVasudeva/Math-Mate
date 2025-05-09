
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Divide, X, Minus, Plus, Equal, Dot } from 'lucide-react'; // Removed SquareRoot
import { useToast } from "@/hooks/use-toast";
import { CalculatorButton } from './calculator-button';
import { PlusMinusIcon } from './plus-minus-icon';

export function ScientificCalculatorSection() {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);
  const [angleMode, setAngleMode] = useState<'rad' | 'deg'>('rad');
  const { toast } = useToast();

  useEffect(() => {
    // Ensure display is '0' on initial client render to avoid hydration mismatch
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
      case '^': result = Math.pow(firstOperand, secondOperand); break;
      default: return null;
    }
    return result !== null ? parseFloat(result.toPrecision(12)) : null;
  };
  
  const handleOperatorClick = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
      setOperator(nextOperator); // Allow changing operator
      return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation();
      if (result === null) return; // Error handled in performCalculation
      setDisplayValue(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const handleEqualsClick = () => {
    const result = performCalculation();
    if (result !== null) {
      setDisplayValue(String(result));
      setFirstOperand(result); // Store result as firstOperand for chained calculations
      setOperator(null); // Clear operator after equals
      setWaitingForSecondOperand(true); // Ready for new input, or new operation on result
    } else if (firstOperand !== null && !operator) {
      // If only firstOperand is set and equals is pressed, just show firstOperand
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
     const currentValue = parseFloat(displayValue);
    if (firstOperand !== null && operator) {
      // Calculate percentage of the first operand
      // e.g. 100 + 10%  => 100 + (100 * 0.10)
      const percentageOfFirst = firstOperand * (currentValue / 100);
      setDisplayValue(String(parseFloat(percentageOfFirst.toPrecision(12))));
      // Note: This result is intermediate, usually followed by an operator or equals
      // For simplicity, we don't auto-calculate here, user must press equals or another op.
    } else {
      // Standard percentage: currentValue / 100
      setDisplayValue(String(parseFloat((currentValue / 100).toPrecision(12))));
    }
    setWaitingForSecondOperand(false); // Allow further input or operations on this new value
  };

  const toggleAngleMode = () => {
    setAngleMode(prevMode => prevMode === 'rad' ? 'deg' : 'rad');
  };
  
  const handleUnaryFunction = (func: string) => {
    let value = parseFloat(displayValue);
    if (isNaN(value)) {
      toast({ title: "Error", description: "Invalid input for function.", variant: "destructive" });
      return;
    }
    let result;
    let valueInRad = angleMode === 'deg' && ['sin', 'cos', 'tan'].includes(func) 
                       ? value * (Math.PI / 180) 
                       : value;

    try {
      switch(func) {
        // Trigonometric
        case 'sin': result = Math.sin(valueInRad); break;
        case 'cos': result = Math.cos(valueInRad); break;
        case 'tan': result = Math.tan(valueInRad); break;
        case 'asin': 
          if (value < -1 || value > 1) throw new Error("Input for asin must be between -1 and 1.");
          result = Math.asin(value); 
          if (angleMode === 'deg') result = result * (180 / Math.PI);
          break;
        case 'acos': 
          if (value < -1 || value > 1) throw new Error("Input for acos must be between -1 and 1.");
          result = Math.acos(value);
          if (angleMode === 'deg') result = result * (180 / Math.PI);
          break;
        case 'atan': 
          result = Math.atan(value);
          if (angleMode === 'deg') result = result * (180 / Math.PI);
          break;
        // Logarithmic
        case 'log': // base 10
          if (value <= 0) throw new Error("Input for log must be positive.");
          result = Math.log10(value); 
          break;
        case 'ln': // base e
          if (value <= 0) throw new Error("Input for ln must be positive.");
          result = Math.log(value); 
          break;
        // Power and roots
        case 'sqrt':
          if (value < 0) throw new Error("Input for sqrt must be non-negative.");
          result = Math.sqrt(value); 
          break;
        case 'x^2': result = Math.pow(value, 2); break;
        // Other
        case '1/x':
          if (value === 0) throw new Error("Cannot divide by zero (1/x).");
          result = 1 / value; 
          break;
        case 'x!':
          if (value < 0 || !Number.isInteger(value)) throw new Error("Factorial is defined for non-negative integers.");
          if (value > 170) throw new Error("Factorial input too large (max 170)."); // JS max safe int for factorial result
          result = 1;
          for (let i = 2; i <= value; i++) result *= i;
          break;
        default: throw new Error("Unknown function");
      }
      setDisplayValue(String(parseFloat(result.toPrecision(12))));
      setWaitingForSecondOperand(true); // Ready for new number or operator
      setFirstOperand(parseFloat(result.toPrecision(12))); // Store result
      setOperator(null); // Clear operator after unary function
    } catch (error: any) {
       toast({ title: "Error", description: error.message || `${func} calculation failed.`, variant: "destructive" });
    }
  };

  const handleConstant = (constant: string) => {
    let value;
    switch(constant) {
      case 'PI': value = Math.PI; break;
      case 'e': value = Math.E; break;
      default: return;
    }
    setDisplayValue(String(parseFloat(value.toPrecision(12))));
    setWaitingForSecondOperand(false); // Allow further input or operations on this new value
  };

  const buttons = [
    { label: angleMode === 'rad' ? 'Rad' : 'Deg', onClick: toggleAngleMode, variant: 'secondary' as const },
    { label: 'sin', onClick: () => handleUnaryFunction('sin'), variant: 'secondary' as const },
    { label: 'cos', onClick: () => handleUnaryFunction('cos'), variant: 'secondary' as const },
    { label: 'tan', onClick: () => handleUnaryFunction('tan'), variant: 'secondary' as const },

    { label: 'xʸ', onClick: () => handleOperatorClick('^'), variant: 'secondary' as const },
    { label: 'log', onClick: () => handleUnaryFunction('log'), variant: 'secondary' as const },
    { label: 'ln', onClick: () => handleUnaryFunction('ln'), variant: 'secondary' as const },
    { label: 'x!', onClick: () => handleUnaryFunction('x!'), variant: 'secondary' as const },
    
    { label: '√', onClick: () => handleUnaryFunction('sqrt'), variant: 'secondary' as const }, // Changed from SquareRoot icon
    { label: 'x²', onClick: () => handleUnaryFunction('x^2'), variant: 'secondary' as const },
    { label: '1/x', onClick: () => handleUnaryFunction('1/x'), variant: 'secondary' as const },
    { label: 'π', onClick: () => handleConstant('PI'), variant: 'secondary' as const },

    { label: 'AC', onClick: handleClear, variant: 'destructive' as const },
    { label: 'e', onClick: () => handleConstant('e'), variant: 'secondary' as const },
    { label: <Percent />, onClick: handlePercent, variant: 'secondary' as const },
    { label: <Divide />, onClick: () => handleOperatorClick('/'), variant: 'accent' as const },
    
    { label: '7', onClick: () => handleNumberClick('7') },
    { label: '8', onClick: () => handleNumberClick('8') },
    { label: '9', onClick: () => handleNumberClick('9') },
    { label: <X />, onClick: () => handleOperatorClick('*'), variant: 'accent' as const },
    
    { label: '4', onClick: () => handleNumberClick('4') },
    { label: '5', onClick: () => handleNumberClick('5') },
    { label: '6', onClick: () => handleNumberClick('6') },
    { label: <Minus />, onClick: () => handleOperatorClick('-'), variant: 'accent' as const },

    { label: '1', onClick: () => handleNumberClick('1') },
    { label: '2', onClick: () => handleNumberClick('2') },
    { label: '3', onClick: () => handleNumberClick('3') },
    { label: <Plus />, onClick: () => handleOperatorClick('+'), variant: 'accent' as const },
    
    { label: '0', onClick: () => handleNumberClick('0'), className: 'col-span-1' },
    { label: <Dot/>, onClick: handleDecimalClick },
    { label: <PlusMinusIcon />, onClick: handlePlusMinus, variant: 'secondary' as const },
    { label: <Equal />, onClick: handleEqualsClick, variant: 'accent' as const },
  ];


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Scientific Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-lg mb-6 text-right">
          <p className="text-3xl sm:text-4xl md:text-5xl font-mono text-foreground break-all h-16 sm:h-20 flex items-center justify-end">{displayValue}</p>
        </div>
        <div className="grid grid-cols-4 grid-rows-8 gap-2">
          {buttons.map((btn, idx) => (
            <CalculatorButton
              key={idx}
              onClick={btn.onClick}
              label={btn.label}
              className={btn.className}
              variant={btn.variant || 'default'}
              size="sm" // Using sm for scientific buttons to fit more
            />
          ))}
        </div>
         <p className="text-xs text-muted-foreground mt-4">
           Angle mode: {angleMode.toUpperCase()}. Trig functions input/output in {angleMode}.
         </p>
      </CardContent>
    </Card>
  );
}

