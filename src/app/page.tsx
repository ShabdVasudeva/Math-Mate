
import { Header } from "@/components/layout/header";
import { BasicCalculatorSection } from "@/components/math-mate/basic-calculator-section";
import { ScientificCalculatorSection } from "@/components/math-mate/scientific-calculator-section";
import { CalculusSolverSection } from "@/components/math-mate/calculus-solver-section";
import { GraphPlotterSection } from "@/components/math-mate/graph-plotter-section";
import { ProgrammerCalculatorSection } from "@/components/math-mate/programmer-calculator-section";
import { CurrencyConverterSection } from "@/components/math-mate/currency-converter-section";
import { UnitConverterSection } from "@/components/math-mate/unit-converter-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FunctionSquare, Sigma, LineChart as LineChartIcon, Binary, Coins, Scale } from "lucide-react";


export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background font-sans">
      <Header />
      <main className="w-full max-w-5xl p-4 sm:p-6 md:p-8 flex-grow">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-7 h-auto mb-6">
            <TabsTrigger value="basic" className="py-2 sm:py-2.5 text-xs sm:text-sm">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="scientific" className="py-2 sm:py-2.5 text-xs sm:text-sm">
              <Sigma className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Scientific
            </TabsTrigger>
            <TabsTrigger value="calculus" className="py-2 sm:py-2.5 text-xs sm:text-sm">
              <FunctionSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Calculus
            </TabsTrigger>
            <TabsTrigger value="graph" className="py-2 sm:py-2.5 text-xs sm:text-sm">
              <LineChartIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Graphing
            </TabsTrigger>
            <TabsTrigger value="programmer" className="py-2 sm:py-2.5 text-xs sm:text-sm">
              <Binary className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Programmer
            </TabsTrigger>
            <TabsTrigger value="currency" className="py-2 sm:py-2.5 text-xs sm:text-sm">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Currency
            </TabsTrigger>
            <TabsTrigger value="unit" className="py-2 sm:py-2.5 text-xs sm:text-sm">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Units
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <BasicCalculatorSection />
          </TabsContent>
          <TabsContent value="scientific">
            <ScientificCalculatorSection />
          </TabsContent>
          <TabsContent value="calculus">
            <CalculusSolverSection />
          </TabsContent>
          <TabsContent value="graph">
            <GraphPlotterSection />
          </TabsContent>
          <TabsContent value="programmer">
            <ProgrammerCalculatorSection />
          </TabsContent>
          <TabsContent value="currency">
            <CurrencyConverterSection />
          </TabsContent>
          <TabsContent value="unit">
            <UnitConverterSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
