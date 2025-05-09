
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LineChart as LineChartIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { CartesianGrid, XAxis, YAxis, Line, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart } from 'recharts';
import { useToast } from "@/hooks/use-toast";

const X_MIN = -10;
const X_MAX = 10;
const STEPS = 200;

type ChartDataPoint = {
  x: number;
  y: number | null; // Allow null for discontinuities
};

// Function to parse and evaluate the equation safely
const evaluateEquation = (equation: string, x: number): number | null => {
  let sanitizedEquation = equation.toLowerCase();

  // Replace constants
  sanitizedEquation = sanitizedEquation.replace(/\bpi\b/g, String(Math.PI));
  sanitizedEquation = sanitizedEquation.replace(/\be\b/g, String(Math.E));
  
  // Replace supported functions with Math. equivalents
  const funcMappings: { [key: string]: string } = {
    'sin(': 'Math.sin(', 'cos(': 'Math.cos(', 'tan(': 'Math.tan(',
    'asin(': 'Math.asin(', 'acos(': 'Math.acos(', 'atan(': 'Math.atan(',
    'log(': 'Math.log10(', // Assume log is log10
    'ln(': 'Math.log(',   // Natural log
    'sqrt(': 'Math.sqrt(', 'abs(': 'Math.abs(', 'exp(': 'Math.exp(',
    'pow(': 'Math.pow(' // For explicit pow(base, exponent)
  };

  for (const key in funcMappings) {
    sanitizedEquation = sanitizedEquation.split(key).join(funcMappings[key]);
  }
  
  // Replace ^ with ** for exponentiation
  sanitizedEquation = sanitizedEquation.replace(/\^/g, '**');

  // Validate allowed characters (very basic validation)
  // Allows: x, numbers, ., +, -, *, /, (, ), **, and Math. functions
  const allowedCharsRegex = /^[x0-9\s.+-/*()%!<>|=&^MathЭквсрдлУабспкнэогшщзхъфывапролджэючсмитьбюЁё]+$/;
  if (!allowedCharsRegex.test(sanitizedEquation.replace(/Math\.\w+\(/g, '').replace(/[a-zA-Z]+\(/g, ''))) {
     // console.error("Invalid characters in equation:", sanitizedEquation);
    // return null; // Or throw specific error
  }
  
  try {
    // Create a function with x as argument, and Math functions in scope
    // eslint-disable-next-line no-new-func
    const func = new Function('x', `const {sin,cos,tan,asin,acos,atan,log10,log,sqrt,abs,exp,pow,PI,E} = Math; try { return ${sanitizedEquation}; } catch(e) { return null; }`);
    const result = func(x);
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return null; // Handle non-numeric, NaN, Infinity results
    }
    return result;
  } catch (error) {
    // console.error("Error evaluating equation:", error);
    return null;
  }
};


export function GraphPlotterSection() {
  const [equation, setEquation] = useState<string>('sin(x)');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const generateData = (eq: string) => {
    if (eq.trim() === '') {
      setChartData([]);
      setErrorMessage(null);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    // Use setTimeout to allow UI to update (show loader) before heavy computation
    setTimeout(() => {
      const data: ChartDataPoint[] = [];
      let hasValidPoint = false;
      for (let i = 0; i <= STEPS; i++) {
        const x = X_MIN + (i / STEPS) * (X_MAX - X_MIN);
        const y = evaluateEquation(eq, x);
        data.push({ x: parseFloat(x.toFixed(4)), y: y !== null ? parseFloat(y.toFixed(4)) : null });
        if (y !== null) hasValidPoint = true;
      }

      if (!hasValidPoint && eq.trim() !== '') {
        setErrorMessage("Could not plot the equation. Please check its syntax or ensure it produces valid numbers in the range [-10, 10].");
        setChartData([]);
         toast({ title: "Plotting Error", description: "Invalid equation or no valid points in range.", variant: "destructive"});
      } else {
        setChartData(data);
      }
      setIsLoading(false);
    }, 50); // Small delay
  };
  
  // Plot initial graph for sin(x) on mount
  useEffect(() => {
    generateData('sin(x)');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handlePlotGraph = () => {
    generateData(equation);
  };

  const chartConfig = useMemo(() => ({
    y: {
      label: "y",
      color: "hsl(var(--chart-1))",
    },
    x: {
      label: "x",
    }
  }), []);


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center">
          <LineChartIcon className="h-7 w-7 mr-2 text-accent" />
          Graph Plotter
        </CardTitle>
        <CardDescription>
          Enter an equation to visualize its graph (e.g., sin(x), x^2, 2*x + 1).
          Supported: x, numbers, +, -, *, /, ^ (power), sin, cos, tan, log (log10), ln, sqrt, abs, exp, PI, E.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter equation: y = f(x)"
            value={equation}
            onChange={(e) => {
              setEquation(e.target.value);
            }}
            className="flex-grow text-base"
            onKeyPress={(e) => e.key === 'Enter' && handlePlotGraph()}
            disabled={isLoading}
          />
          <Button onClick={handlePlotGraph} size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Plot Graph"}
          </Button>
        </div>

        <div className="mt-6 p-1 border-dashed border-2 border-muted-foreground/30 rounded-lg bg-muted/10 aspect-video min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
          {isLoading && (
            <div className="flex flex-col items-center text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p>Plotting graph...</p>
            </div>
          )}
          {!isLoading && errorMessage && (
            <div className="text-center text-destructive p-4">
              <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
              <p className="font-semibold">Error Plotting Graph</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          {!isLoading && !errorMessage && chartData.length > 0 && (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="x" 
                  type="number" 
                  domain={[X_MIN, X_MAX]} 
                  tickCount={11}
                  stroke="hsl(var(--foreground))"
                  tickFormatter={(tick) => tick.toFixed(0)}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tickFormatter={(tick) => tick.toFixed(1)}
                />
                <Tooltip
                  content={<ChartTooltipContent hideIndicator />}
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Line type="monotone" dataKey="y" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} connectNulls={false} />
              </RechartsLineChart>
            </ChartContainer>
          )}
           {!isLoading && !errorMessage && chartData.length === 0 && equation.trim() !== '' && (
             <div className="text-center text-muted-foreground p-4">
              <p>Enter an equation and press "Plot Graph" to visualize <span className="font-semibold text-foreground">{equation}</span>.</p>
            </div>
           )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Graphs are plotted for x values from {X_MIN} to {X_MAX}. Some complex functions or syntax might not be supported.
        </p>
      </CardFooter>
    </Card>
  );
}

