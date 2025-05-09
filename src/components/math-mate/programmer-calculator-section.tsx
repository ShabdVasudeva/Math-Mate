
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Binary as BinaryIcon, RotateCcw } from 'lucide-react';
import { CalculatorButton } from './calculator-button';

type Base = 'DEC' | 'HEX' | 'OCT' | 'BIN';

const MAX_DECIMAL_VALUE = Number.MAX_SAFE_INTEGER; // For bitwise ops, often 32-bit or 64-bit signed/unsigned

export function ProgrammerCalculatorSection() {
  const [inputValue, setInputValue] = useState<string>('0');
  const [currentBase, setCurrentBase] = useState<Base>('DEC');
  const [outputValues, setOutputValues] = useState({ DEC: '0', HEX: '0', OCT: '0', BIN: '0' });
  const { toast } = useToast();

  useEffect(() => {
    updateOutputValues(inputValue, currentBase);
  }, [inputValue, currentBase]);

  const isValidForBase = (value: string, base: Base): boolean => {
    if (value === '' || value === '-') return true;
    const patterns: Record<Base, RegExp> = {
      DEC: /^-?\d+$/,
      HEX: /^[0-9a-fA-F]+$/,
      OCT: /^[0-7]+$/,
      BIN: /^[01]+$/,
    };
    return patterns[base].test(value);
  };

  const parseValue = (value: string, base: Base): number => {
    if (!isValidForBase(value, base) || value === '' || value === '-') return 0;
    switch (base) {
      case 'DEC': return parseInt(value, 10);
      case 'HEX': return parseInt(value, 16);
      case 'OCT': return parseInt(value, 8);
      case 'BIN': return parseInt(value, 2);
      default: return 0;
    }
  };

  const formatValue = (value: number, base: Base): string => {
    if (isNaN(value)) return 'Error';
    // Cap values for display to avoid overly long strings or scientific notation for very large numbers
    // For bitwise operations, we usually deal with up to 64-bit integers.
    // JavaScript numbers are IEEE 754 double-precision. For true arbitrary precision, use BigInt.
    // This is a simplified version.
    
    let numForConversion = value;
    // For bitwise ops, often a 32-bit context is assumed for display if not specified.
    // We'll just use standard Number.toString() which might not be ideal for all prog cases.

    switch (base) {
      case 'DEC': return numForConversion.toString(10);
      case 'HEX': return numForConversion.toString(16).toUpperCase();
      case 'OCT': return numForConversion.toString(8);
      case 'BIN': return numForConversion.toString(2);
      default: return 'Error';
    }
  };
  
  const updateOutputValues = (val: string, base: Base) => {
    const numValue = parseValue(val, base);
    if (isNaN(numValue) && val !== '' && val !== '-') {
        setOutputValues({ DEC: 'Error', HEX: 'Error', OCT: 'Error', BIN: 'Error' });
        return;
    }
    if (Math.abs(numValue) > MAX_DECIMAL_VALUE) {
      toast({ title: "Warning", description: "Input value exceeds safe integer limit for precise conversion/bitwise operations.", variant: "default" });
    }

    setOutputValues({
      DEC: formatValue(numValue, 'DEC'),
      HEX: formatValue(numValue, 'HEX'),
      OCT: formatValue(numValue, 'OCT'),
      BIN: formatValue(numValue, 'BIN'),
    });
  };

  const handleInputChange = (value: string) => {
    const sanitizedValue = currentBase === 'HEX' ? value.replace(/[^0-9a-fA-F]/g, '') : value.replace(/[^0-9]/g, '');
    if (isValidForBase(sanitizedValue, currentBase) || sanitizedValue === '' || sanitizedValue === '-') {
      setInputValue(sanitizedValue === '' ? '0' : sanitizedValue);
    }
  };
  
  const handleBaseChange = (newBase: Base) => {
    const currentNumericValue = parseValue(inputValue, currentBase);
    setCurrentBase(newBase);
    setInputValue(formatValue(currentNumericValue, newBase));
  };

  const handleDigitClick = (digit: string) => {
    if (inputValue === '0' && digit !== '.') { // Allow leading zeros for OCT/BIN if desired, but typically '0' is replaced
      setInputValue(digit);
    } else {
      const newValue = inputValue + digit;
      if (isValidForBase(newValue, currentBase)) {
        setInputValue(newValue);
      }
    }
  };

  const handleClear = () => {
    setInputValue('0');
    updateOutputValues('0', currentBase);
  };

  const handleBitwiseOperation = (operation: 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT') => {
    let num = parseValue(inputValue, currentBase);
    if (isNaN(num)) {
      toast({ title: "Error", description: "Invalid input for bitwise operation.", variant: "destructive" });
      return;
    }

    // Bitwise operations in JS are performed on 32-bit signed integers.
    // For larger numbers or specific unsigned behavior, BigInt is necessary.
    // This is a simplified implementation.
    try {
      let result: number;
      switch (operation) {
        case 'NOT':
          result = ~num;
          break;
        // For binary operations, we'd typically need a second operand.
        // This calculator structure is more for unary ops or direct input changes.
        // Let's simplify: LSHIFT/RSHIFT by 1 bit for now.
        case 'LSHIFT':
          result = num << 1;
          break;
        case 'RSHIFT':
          result = num >> 1; // Arithmetic right shift
          break;
        default:
          toast({ title: "Info", description: `${operation} requires a second operand (not implemented in this basic UI).`, variant: "default" });
          return;
      }
       setInputValue(formatValue(result, currentBase));
    } catch (e) {
        toast({ title: "Error", description: "Bitwise operation failed.", variant: "destructive" });
    }
  };
  
  const baseDigits: Record<Base, string[]> = {
    DEC: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    HEX: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
    OCT: ['0', '1', '2', '3', '4', '5', '6', '7'],
    BIN: ['0', '1'],
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center">
          <BinaryIcon className="h-7 w-7 mr-2 text-accent" />
          Programmer Calculator
        </CardTitle>
        <CardDescription>
          Perform calculations in different number bases (Decimal, Hexadecimal, Octal, Binary) and bitwise operations.
          Note: Bitwise operations use 32-bit signed integer context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="programmer-input" className="text-lg">Input Value</Label>
          <Input
            id="programmer-input"
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="text-2xl h-12 mt-1 font-mono text-right"
            maxLength={currentBase === 'BIN' ? 64 : currentBase === 'HEX' ? 16 : 20} // Example maxLength
          />
        </div>

        <div>
          <Label className="text-lg">Number Base</Label>
          <RadioGroup
            value={currentBase}
            onValueChange={(newBase) => handleBaseChange(newBase as Base)}
            className="flex space-x-4 mt-2"
          >
            {(['DEC', 'HEX', 'OCT', 'BIN'] as Base[]).map((base) => (
              <div key={base} className="flex items-center space-x-2">
                <RadioGroupItem value={base} id={`base-${base.toLowerCase()}`} />
                <Label htmlFor={`base-${base.toLowerCase()}`}>{base}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          {(['DEC', 'HEX', 'OCT', 'BIN'] as Base[]).map((base) => (
            <div key={base} className="flex items-center">
              <Label className="w-12 font-semibold">{base}:</Label>
              <p className="font-mono text-sm sm:text-base break-all bg-muted/30 p-2 rounded-md flex-1">{outputValues[base]}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {baseDigits[currentBase].map((digit) => (
            <CalculatorButton key={digit} label={digit} onClick={() => handleDigitClick(digit)} size="sm" />
          ))}
           <CalculatorButton label="AC" onClick={handleClear} variant="destructive" size="sm" className="col-span-2"/>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4">
          <Button onClick={() => handleBitwiseOperation('LSHIFT')} variant="secondary" size="sm">Lsh</Button>
          <Button onClick={() => handleBitwiseOperation('RSHIFT')} variant="secondary" size="sm">Rsh</Button>
          <Button onClick={() => handleBitwiseOperation('NOT')} variant="secondary" size="sm">NOT</Button>
          {/* Other ops like AND, OR, XOR would typically need a binary calculator UI structure */}
        </div>
         <CardDescription className="text-xs">
            Note: For binary operations like AND, OR, XOR, this calculator currently only processes the displayed number with unary operations (NOT, LSHIFT, RSHIFT). Full binary operations would require a more complex interface.
          </CardDescription>

      </CardContent>
    </Card>
  );
}
