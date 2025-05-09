
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Scale as ScaleIcon, ArrowRightLeft } from 'lucide-react';

type UnitCategory = 'Length' | 'Weight' | 'Temperature' | 'Volume';

interface Unit {
  symbol: string;
  name: string;
  category: UnitCategory;
  toBase: (value: number) => number; // Converts value to base unit of its category
  fromBase: (value: number) => number; // Converts value from base unit of its category
}

const unitsData: Unit[] = [
  // Length (Base: meter)
  { category: 'Length', symbol: 'm', name: 'Meter', toBase: v => v, fromBase: v => v },
  { category: 'Length', symbol: 'km', name: 'Kilometer', toBase: v => v * 1000, fromBase: v => v / 1000 },
  { category: 'Length', symbol: 'cm', name: 'Centimeter', toBase: v => v / 100, fromBase: v => v * 100 },
  { category: 'Length', symbol: 'mm', name: 'Millimeter', toBase: v => v / 1000, fromBase: v => v * 1000 },
  { category: 'Length', symbol: 'mi', name: 'Mile', toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
  { category: 'Length', symbol: 'ft', name: 'Foot', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
  { category: 'Length', symbol: 'in', name: 'Inch', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
  // Weight (Base: kilogram)
  { category: 'Weight', symbol: 'kg', name: 'Kilogram', toBase: v => v, fromBase: v => v },
  { category: 'Weight', symbol: 'g', name: 'Gram', toBase: v => v / 1000, fromBase: v => v * 1000 },
  { category: 'Weight', symbol: 'mg', name: 'Milligram', toBase: v => v / 1000000, fromBase: v => v * 1000000 },
  { category: 'Weight', symbol: 'lb', name: 'Pound', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
  { category: 'Weight', symbol: 'oz', name: 'Ounce', toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
  // Temperature (Base: Celsius for inter-conversion logic)
  { category: 'Temperature', symbol: '°C', name: 'Celsius', toBase: v => v, fromBase: v => v },
  { category: 'Temperature', symbol: '°F', name: 'Fahrenheit', toBase: v => (v - 32) * 5/9, fromBase: v => (v * 9/5) + 32 },
  { category: 'Temperature', symbol: 'K', name: 'Kelvin', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
  // Volume (Base: liter)
  { category: 'Volume', symbol: 'L', name: 'Liter', toBase: v => v, fromBase: v => v },
  { category: 'Volume', symbol: 'mL', name: 'Milliliter', toBase: v => v / 1000, fromBase: v => v * 1000 },
  { category: 'Volume', symbol: 'gal', name: 'US Gallon', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
  { category: 'Volume', symbol: 'm³', name: 'Cubic Meter', toBase: v => v * 1000, fromBase: v => v / 1000 },
];

const unitCategories: UnitCategory[] = ['Length', 'Weight', 'Temperature', 'Volume'];

export function UnitConverterSection() {
  const [category, setCategory] = useState<UnitCategory>('Length');
  const [fromUnit, setFromUnit] = useState<string>(unitsData.find(u => u.category === 'Length')?.symbol || 'm');
  const [toUnit, setToUnit] = useState<string>(unitsData.find(u => u.category === 'Length' && u.symbol !== 'm')?.symbol || 'km');
  const [inputValue, setInputValue] = useState<string>('1');
  const [outputValue, setOutputValue] = useState<string>('');
  const { toast } = useToast();

  const availableUnits = unitsData.filter(u => u.category === category);

  useEffect(() => {
    // Reset units when category changes
    const defaultFromUnit = availableUnits[0]?.symbol;
    const defaultToUnit = availableUnits[1]?.symbol || availableUnits[0]?.symbol;
    setFromUnit(defaultFromUnit || '');
    setToUnit(defaultToUnit || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);
  
  useEffect(() => {
    convertUnits();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, fromUnit, toUnit, category]);

  const convertUnits = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) && inputValue !== '' && inputValue !== '-') {
        setOutputValue('');
        if (inputValue.trim() !== '') {
             toast({ title: "Invalid Input", description: "Please enter a valid number.", variant: "destructive" });
        }
        return;
    }
    if (inputValue.trim() === '' || inputValue.trim() === '-') {
        setOutputValue('');
        return;
    }


    const unitFrom = unitsData.find(u => u.symbol === fromUnit && u.category === category);
    const unitTo = unitsData.find(u => u.symbol === toUnit && u.category === category);

    if (unitFrom && unitTo) {
      if (unitFrom.symbol === unitTo.symbol) {
        setOutputValue(inputValue); // Same unit, no conversion needed
        return;
      }
      const valueInBase = unitFrom.toBase(numValue);
      const result = unitTo.fromBase(valueInBase);
      // For temperature, avoid excessive precision
      const precision = category === 'Temperature' ? 2 : 5; 
      setOutputValue(result.toFixed(precision));
    } else {
      setOutputValue('Error');
      toast({ title: "Conversion Error", description: "Selected units are not valid for conversion.", variant: "destructive" });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty, negative sign, numbers (with optional decimal)
    if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center">
          <ScaleIcon className="h-7 w-7 mr-2 text-accent" />
          Unit Converter
        </CardTitle>
        <CardDescription>
          Convert between different units of measurement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="unit-category" className="text-lg">Category</Label>
          <Select value={category} onValueChange={(val) => setCategory(val as UnitCategory)}>
            <SelectTrigger id="unit-category" className="text-xl h-12 mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {unitCategories.map(cat => (
                <SelectItem key={cat} value={cat} className="text-lg">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="input-value" className="text-lg">Value</Label>
            <Input
              id="input-value"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter value"
              className="text-xl h-12 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="from-unit-select" className="text-lg">From</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger id="from-unit-select" className="text-xl h-12 mt-1">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map(unit => (
                  <SelectItem key={unit.symbol} value={unit.symbol} className="text-lg">
                    {unit.name} ({unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center items-center my-4">
          <Button variant="ghost" size="icon" onClick={handleSwapUnits} aria-label="Swap units">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="output-value" className="text-lg">Converted Value</Label>
            <Input
              id="output-value"
              type="text"
              value={outputValue}
              readOnly
              placeholder="Result"
              className="text-xl h-12 mt-1 bg-muted/50"
            />
          </div>
          <div>
            <Label htmlFor="to-unit-select" className="text-lg">To</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger id="to-unit-select" className="text-xl h-12 mt-1">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map(unit => (
                  <SelectItem key={unit.symbol} value={unit.symbol} className="text-lg">
                    {unit.name} ({unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={convertUnits} className="w-full mt-4 sm:w-auto" size="lg">
          Convert
        </Button>
      </CardContent>
    </Card>
  );
}
