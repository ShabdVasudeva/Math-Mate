
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Coins as CoinsIcon, ArrowRightLeft } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  rate: number; // Rate against a base currency (e.g., USD)
}

const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', rate: 1 },
  { code: 'EUR', name: 'Euro', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', rate: 157.00 },
  { code: 'INR', name: 'Indian Rupee', rate: 83.50 },
  { code: 'CAD', name: 'Canadian Dollar', rate: 1.37 },
  { code: 'AUD', name: 'Australian Dollar', rate: 1.50 },
  { code: 'CHF', name: 'Swiss Franc', rate: 0.90 },
];

export function CurrencyConverterSection() {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    convertCurrency();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromCurrency, toCurrency]);

  const convertCurrency = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setConvertedAmount('');
      if (amount.trim() !== '' && amount.trim() !== '-') {
        toast({ title: "Invalid Amount", description: "Please enter a valid positive number.", variant: "destructive" });
      }
      return;
    }

    const rateFrom = currencies.find(c => c.code === fromCurrency)?.rate;
    const rateTo = currencies.find(c => c.code === toCurrency)?.rate;

    if (rateFrom && rateTo) {
      const result = (numAmount / rateFrom) * rateTo;
      setConvertedAmount(result.toFixed(2));
    } else {
      setConvertedAmount('Error');
      toast({ title: "Conversion Error", description: "Could not find exchange rates.", variant: "destructive" });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     // Allow empty, or numbers (with optional decimal)
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center">
          <CoinsIcon className="h-7 w-7 mr-2 text-accent" />
          Currency Converter
        </CardTitle>
        <CardDescription>
          Convert between different currencies using pre-defined exchange rates. The conversion calculation updates live as you type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="amount-from" className="text-lg">Amount</Label>
            <Input
              id="amount-from"
              type="text" 
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="text-xl h-12 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="from-currency" className="text-lg">From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger id="from-currency" className="text-xl h-12 mt-1">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency.code} value={currency.code} className="text-lg">
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center items-center my-4">
          <Button variant="ghost" size="icon" onClick={handleSwapCurrencies} aria-label="Swap currencies">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="amount-to" className="text-lg">Converted Amount</Label>
            <Input
              id="amount-to"
              type="text"
              value={convertedAmount}
              readOnly
              placeholder="Result"
              className="text-xl h-12 mt-1 bg-muted/50"
            />
          </div>
          <div>
            <Label htmlFor="to-currency" className="text-lg">To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger id="to-currency" className="text-xl h-12 mt-1">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency.code} value={currency.code} className="text-lg">
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={convertCurrency} className="w-full mt-4 sm:w-auto" size="lg">
          Convert
        </Button>
         <CardDescription className="text-xs pt-4">
            Disclaimer: The exchange rates used in this converter are pre-defined for illustrative purposes only and are not updated in real-time from financial markets. Do not use for financial decisions.
          </CardDescription>
      </CardContent>
    </Card>
  );
}

