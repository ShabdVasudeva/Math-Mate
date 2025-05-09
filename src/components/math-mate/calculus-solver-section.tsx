
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { FunctionSquare, Sigma } from 'lucide-react';

const calculusFormSchema = z.object({
  expression: z.string().min(1, { message: "Expression cannot be empty." }).max(100, { message: "Expression too long." }),
  variable: z.string().min(1, {message: "Variable cannot be empty."}).max(5, {message: "Variable too long."}).default('x'),
});

type CalculusFormValues = z.infer<typeof calculusFormSchema>;

const differentiate = (expr: string, variable: string): string => {
  expr = expr.replace(/\s+/g, '');

  if (expr === variable) return "1";
  if (expr === `sin(${variable})`) return `cos(${variable})`;
  if (expr === `cos(${variable})`) return `-sin(${variable})`;
  if (expr === `tan(${variable})`) return `sec^2(${variable})`;
  
  const polyMatch = expr.match(new RegExp(`^([+-]?\\d*\\.?\\d*)${variable}(?:\\^([+-]?\\d+))?$`));
  if (polyMatch) {
    const coeffStr = polyMatch[1];
    const powerStr = polyMatch[2]; // Index changed from 3 to 2 due to non-capturing group
    
    let coeff = coeffStr === '' || coeffStr === '+' ? 1 : coeffStr === '-' ? -1 : parseFloat(coeffStr);
    let power = powerStr ? parseInt(powerStr) : 1;

    if (isNaN(coeff)) coeff = (coeffStr === variable || coeffStr === `+${variable}`) ? 1 : (coeffStr === `-${variable}`) ? -1 : 1; // Handles cases like 'x^2' or '-x^2'
    if (powerStr === '' && expr.endsWith(variable)) power = 1; // Handles 'x' as 'x^1'

    if (power === 0) return "0"; 

    const newCoeff = coeff * power;
    const newPower = power - 1;

    if (newPower === 0) return String(newCoeff);
    
    let termCoeffStr = "";
    if (newCoeff === 1) termCoeffStr = "";
    else if (newCoeff === -1) termCoeffStr = "-";
    else termCoeffStr = String(newCoeff);

    if (newPower === 1) return `${termCoeffStr}${variable}`;
    return `${termCoeffStr}${variable}^${newPower}`;
  }

  const constantMatch = expr.match(/^([+-]?\d+\.?\d*)$/);
  if (constantMatch && !expr.includes(variable)) return "0";

  const sumMatch = expr.match(/(.+)\+(.+)/);
  if (sumMatch) {
    const term1 = differentiate(sumMatch[1].trim(), variable);
    const term2 = differentiate(sumMatch[2].trim(), variable);
    if (term1 === "Unsupported" || term2 === "Unsupported") return "Unsupported expression: sum/difference terms are complex.";
    if (term2.startsWith('-') || term2 === "0") return `${term1} ${term2 === "0" ? '' : term2}`.trim();
    return `${term1} + ${term2}`;
  }

  const diffMatch = expr.match(/(.+)-(.+)/);
   if (diffMatch) {
    const term1 = differentiate(diffMatch[1].trim(), variable);
    const term2Raw = diffMatch[2].trim();
    const term2Derivative = differentiate(term2Raw, variable);
    
    if (term1 === "Unsupported" || term2Derivative === "Unsupported") return "Unsupported expression: sum/difference terms are complex.";
    if (term2Derivative === "0") return term1;
    if (term2Derivative.startsWith('-')) {
        return `${term1} + ${term2Derivative.substring(1)}`;
    }
    return `${term1} - ${term2Derivative}`;
  }

  return "Unsupported expression. Only simple polynomials (e.g., 3x^2, x^-1, 5) and basic trig (sin(x), cos(x), tan(x)) are supported.";
};

const integrate = (expr: string, variable: string): string => {
  expr = expr.replace(/\s+/g, '');

  if (expr === `sin(${variable})`) return `-cos(${variable}) + C`;
  if (expr === `cos(${variable})`) return `sin(${variable}) + C`;
  
  const polyMatch = expr.match(new RegExp(`^([+-]?\\d*\\.?\\d*)${variable}(?:\\^([+-]?\\d+))?$`));
   if (polyMatch) {
    const coeffStr = polyMatch[1]; // Index changed
    const powerStr = polyMatch[2]; // Index changed
    
    let coeff = coeffStr === '' || coeffStr === '+' ? 1 : coeffStr === '-' ? -1 : parseFloat(coeffStr);
    let power = powerStr ? parseInt(powerStr) : 1;

    if (isNaN(coeff)) coeff = (coeffStr === variable || coeffStr === `+${variable}`) ? 1 : (coeffStr === `-${variable}`) ? -1 : 1;
    if (powerStr === '' && expr.endsWith(variable)) power = 1;


    if (power === -1) {
        let prefix = "";
        if (coeff === -1) prefix = "-";
        else if (coeff !== 1) prefix = String(coeff);
        return `${prefix}ln|${variable}| + C`;
    }

    const newPower = power + 1;
    const numIntegralCoeff = coeff / newPower;

    let strIntegralCoeff;
    if (numIntegralCoeff === 1) strIntegralCoeff = "";
    else if (numIntegralCoeff === -1) strIntegralCoeff = "-";
    else {
      // Try to keep as fraction for better precision representation, if simple
      if (coeff % newPower === 0) { // Divides evenly
        strIntegralCoeff = String(numIntegralCoeff);
      } else { // Basic fraction or fallback to decimal
         // Simple fraction representation would be coeff/newPower e.g. (3/2)x^2.
         // For now, using toFixed for simplicity as before, but this can be improved.
         strIntegralCoeff = numIntegralCoeff.toFixed(2).replace(/\.00$/, '').replace(/\.$/, '');
         if (strIntegralCoeff.includes('.') && newPower !== 0) { // e.g. (0.67)x^3
            strIntegralCoeff = `(${strIntegralCoeff})`;
         }
      }
    }
    
    if (newPower === 1) return `${strIntegralCoeff}${variable} + C`; // e.g. x+C or 2x+C
    // Note: if original power was 0 (constant like x^0=1), newPower is 1. integral is x+C. Correct.
    // strIntegralCoeff would be "" if coeff was 1. So "x+C".
    // if original coeff was 'a' (ax^0), numIntegralCoeff=a/1=a. strIntegralCoeff='a'. So "ax+C". Correct.

    return `${strIntegralCoeff}${variable}^${newPower} + C`;
  }

  const constantMatch = expr.match(/^([+-]?\d+\.?\d*)$/);
  if (constantMatch && !expr.includes(variable)) {
    const constantVal = parseFloat(constantMatch[1]);
    if (constantVal === 0) return "C";
    return `${constantVal}${variable} + C`;
  }
  if (expr === variable) return `(1/2)${variable}^2 + C`; 

  const sumMatch = expr.match(/(.+)\+(.+)/);
  if (sumMatch) {
    const term1Int = integrate(sumMatch[1].trim(), variable).replace(" + C", "");
    const term2Int = integrate(sumMatch[2].trim(), variable).replace(" + C", "");
    if (term1Int.includes("Unsupported") || term2Int.includes("Unsupported")) return "Unsupported expression: sum/difference terms are complex for integration.";
    return `${term1Int} + ${term2Int} + C`;
  }

  const diffMatch = expr.match(/(.+)-(.+)/);
  if (diffMatch) {
    const term1Int = integrate(diffMatch[1].trim(), variable).replace(" + C", "");
    const term2Int = integrate(diffMatch[2].trim(), variable).replace(" + C", "");
     if (term1Int.includes("Unsupported") || term2Int.includes("Unsupported")) return "Unsupported expression: sum/difference terms are complex for integration.";
    // Ensure correct formatting for subtraction
    if (term2Int.startsWith("-")) {
        return `${term1Int} + ${term2Int.substring(1)} + C`;
    }
    return `${term1Int} - ${term2Int} + C`;
  }

  return "Unsupported expression. Only simple polynomials (e.g., 3x^2, x^-1, 5) and basic sin/cos are supported for integration.";
};


export function CalculusSolverSection() {
  const [resultText, setResultText] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<CalculusFormValues>({
    resolver: zodResolver(calculusFormSchema),
    defaultValues: {
      expression: '',
      variable: 'x',
    },
  });

  const handleDifferentiate: SubmitHandler<CalculusFormValues> = (data) => {
    try {
      const derivative = differentiate(data.expression, data.variable);
      setResultText(`d/d${data.variable}(${data.expression}) = ${derivative}`);
      toast({ title: "Differentiation Complete", description: "The derivative has been calculated." });
    } catch (error) {
      console.error("Differentiation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to differentiate.";
      setResultText(`Error: ${errorMessage}`);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleIntegrate: SubmitHandler<CalculusFormValues> = (data) => {
    try {
      const integral = integrate(data.expression, data.variable);
      setResultText(`∫(${data.expression})d${data.variable} = ${integral}`);
      toast({ title: "Integration Complete", description: "The integral has been calculated." });
    } catch (error) {
      console.error("Integration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to integrate.";
      setResultText(`Error: ${errorMessage}`);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center">
          <FunctionSquare className="h-7 w-7 mr-2 text-accent" />
          Calculus Solver
        </CardTitle>
        <CardDescription>
          Enter an expression and variable to calculate its derivative or integral.
          Supports simple polynomials (e.g., 3x^2, x^-1, 5) and basic trig (sin(x), cos(x), tan(x) with respect to x). Limited support for sums/differences.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="expression"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Expression</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., x^2 + x^-1 or sin(x)"
                    className="text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="variable"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">With respect to variable</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., x"
                    className="text-base w-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end sm:gap-4 pt-4">
          <Button type="button" onClick={form.handleSubmit(handleDifferentiate)} size="lg" className="w-full sm:w-auto">
            <Sigma className="mr-2 h-5 w-5" /> Differentiate
          </Button>
          <Button type="button" onClick={form.handleSubmit(handleIntegrate)} size="lg" variant="secondary" className="w-full sm:w-auto">
            ∫ Integrate
          </Button>
        </CardFooter>
      </Form>
      {resultText && (
        <CardContent className="mt-6">
          <h3 className="text-xl font-semibold text-primary mb-2">Result:</h3>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-mono text-sm sm:text-base whitespace-pre-wrap break-words">{resultText}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

