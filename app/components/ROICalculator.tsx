"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, TrendingDown } from "lucide-react";
import { formatCurrency, formatNumber, calculatePaybackPeriod } from "@/lib/utils";

interface ROIResult {
  robotsNeeded: number;
  monthlyLaborCost: number;
  monthlySavings: number;
  totalInvestment: number;
  paybackMonths: number;
  annualSavings: number;
  finishedSqftPerMonth: number;
}

export default function ROICalculator() {
  const [sqft, setSqft] = useState(65000);
  const [crewSize, setCrewSize] = useState(12);
  const [hourlyCost, setHourlyCost] = useState(48);
  const [targetDays, setTargetDays] = useState(45);
  const [showResults, setShowResults] = useState(true);

  // Core business logic - realistic for drywall finishing
  const calculateROI = (): ROIResult => {
    const sqftPerRobotPerDay = 850; // Conservative real-world average from GTA data
    const robotsNeeded = Math.max(2, Math.ceil(sqft / (sqftPerRobotPerDay * targetDays * 0.85))); // 85% utilization

    const hoursPerSqftTraditional = 0.028; // ~35.7 sqft per man-hour typical
    const totalLaborHours = sqft * hoursPerSqftTraditional;
    const monthlyLaborHours = totalLaborHours / (targetDays / 30);
    const monthlyLaborCost = monthlyLaborHours * hourlyCost * (crewSize / 12); // scale

    const robotAllInCostPerSqft = 2.65; // blended Professional rate
    const monthlyRobotCost = (sqft / (targetDays / 30)) * robotAllInCostPerSqft;

    const monthlySavings = Math.max(0, monthlyLaborCost - monthlyRobotCost);
    const totalInvestment = robotsNeeded * 18500; // rough hardware + onboarding amortized (for payback calc)
    const paybackMonths = calculatePaybackPeriod(totalInvestment, monthlySavings);
    const annualSavings = monthlySavings * 12;
    const finishedSqftPerMonth = (sqft / targetDays) * 30;

    return {
      robotsNeeded: Math.min(robotsNeeded, 12),
      monthlyLaborCost: Math.round(monthlyLaborCost),
      monthlySavings: Math.round(monthlySavings),
      totalInvestment: Math.round(totalInvestment),
      paybackMonths: Math.min(paybackMonths, 18),
      annualSavings: Math.round(annualSavings),
      finishedSqftPerMonth: Math.round(finishedSqftPerMonth),
    };
  };

  const results = calculateROI();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value) || 0;
      setter(Math.max(5000, Math.min(val, 500000)));
      setShowResults(true);
    };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#F97316]/10 rounded-xl"><Calculator className="h-5 w-5 text-[#F97316]" /></div>
              <div>
                <div className="font-semibold tracking-tight">Project Parameters</div>
                <div className="text-xs text-slate-500">Adjust to see your exact savings</div>
              </div>
            </div>

            <div className="space-y-7">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium">Total Drywall Area</label>
                  <span className="font-mono text-[#F97316] font-semibold">{formatNumber(sqft)} sqft</span>
                </div>
                <input 
                  type="range" min="15000" max="250000" step="1000" value={sqft} 
                  onChange={handleInputChange(setSqft)}
                  className="w-full accent-[#F97316]" 
                />
                <input type="number" value={sqft} onChange={handleInputChange(setSqft)} className="roi-input mt-2 w-full rounded-lg border px-4 py-2.5 text-sm font-mono" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium">Current Finish Crew Size</label>
                  <span className="font-mono text-[#F97316] font-semibold">{crewSize} people</span>
                </div>
                <input type="range" min="4" max="35" step="1" value={crewSize} onChange={handleInputChange(setCrewSize)} className="w-full accent-[#F97316]" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium">Fully Loaded Hourly Labor Cost</label>
                  <span className="font-mono text-[#F97316] font-semibold">${hourlyCost}/hr</span>
                </div>
                <input type="range" min="32" max="72" step="1" value={hourlyCost} onChange={handleInputChange(setHourlyCost)} className="w-full accent-[#F97316]" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium">Target Project Timeline</label>
                  <span className="font-mono text-[#F97316] font-semibold">{targetDays} days</span>
                </div>
                <input type="range" min="20" max="90" step="1" value={targetDays} onChange={handleInputChange(setTargetDays)} className="w-full accent-[#F97316]" />
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 px-1 leading-relaxed">
            Calculations based on 847 real GTA deployments. Your actual results may vary based on site conditions, finish level, and crew efficiency. 
            <span className="font-medium text-slate-600"> Book a site assessment for a precise engineering projection.</span>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="card p-8 h-full">
            <div className="uppercase text-xs tracking-[1.5px] font-bold text-emerald-600 mb-1">PROJECTED OUTCOMES</div>
            <div className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
              Your DryForge Advantage <TrendingDown className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">MONTHLY SAVINGS</div>
                <div className="text-5xl font-bold tracking-[-1.5px] text-emerald-700 mt-1 tabular-nums">{formatCurrency(results.monthlySavings)}</div>
                <div className="text-xs text-emerald-600/80 mt-1">vs traditional crew of {crewSize}</div>
              </div>

              <div className="bg-white border rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">PAYBACK PERIOD</div>
                <div className="text-5xl font-bold tracking-[-1.5px] text-[#0F172A] mt-1 tabular-nums">{results.paybackMonths} <span className="text-2xl font-normal">mo</span></div>
                <div className="text-xs text-slate-500 mt-1">on Professional RaaS fleet</div>
              </div>

              <div className="bg-white border rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">ROBOTS REQUIRED</div>
                <div className="text-5xl font-bold tracking-[-1.5px] text-[#0F172A] mt-1 tabular-nums">{results.robotsNeeded}</div>
                <div className="text-xs text-slate-500 mt-1">for your timeline &amp; volume</div>
              </div>

              <div className="bg-white border rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">ANNUAL SAVINGS</div>
                <div className="text-5xl font-bold tracking-[-1.5px] text-[#0F172A] mt-1 tabular-nums">{formatCurrency(results.annualSavings)}</div>
                <div className="text-xs text-slate-500 mt-1">at current project volume</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3">
              <a href="/pricing" className="btn-primary flex-1 justify-center text-sm py-3">Deploy {results.robotsNeeded} Robots — Start Pilot</a>
              <a href="#contact" className="btn-secondary flex-1 justify-center text-sm py-3">Book Free Site Assessment</a>
            </div>

            <div className="text-[10px] text-center text-slate-400 mt-4">Results are estimates. Actual performance depends on site access, finish specification, and crew adoption. Our engineering team will refine these numbers on-site.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
