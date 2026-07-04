"use client";

import React, { useState } from "react";
import { Calculator, TrendingDown } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

// Model assumptions — targets and industry benchmarks, NOT measured DryForge data.
const TARGET_RATE_PER_SQFT = 2.85; // DryForge target all-in RaaS rate (CAD)
const TARGET_SQFT_PER_ROBOT_DAY = 850; // engineering design target
const HOURS_PER_SQFT_MANUAL = 0.028; // ~36 sqft/man-hour, typical published finishing benchmark
const ROBOT_UTILIZATION = 0.85;

interface ROIResult {
  robotsNeeded: number;
  manualLaborCost: number;
  robotServiceCost: number;
  estimatedSavings: number;
  savingsPercent: number;
  manualCrewDays: number;
}

export default function ROICalculator() {
  const [sqft, setSqft] = useState(65000);
  const [crewSize, setCrewSize] = useState(12);
  const [hourlyCost, setHourlyCost] = useState(48);
  const [targetDays, setTargetDays] = useState(45);

  const calculateROI = (): ROIResult => {
    // Manual baseline: total finishing labor cost for the project
    const totalLaborHours = sqft * HOURS_PER_SQFT_MANUAL;
    const manualLaborCost = totalLaborHours * hourlyCost;
    const manualCrewDays = Math.ceil(totalLaborHours / (crewSize * 8));

    // Robot-assisted: target RaaS rate, all-in
    const robotServiceCost = sqft * TARGET_RATE_PER_SQFT;
    const robotsNeeded = Math.max(
      1,
      Math.ceil(sqft / (TARGET_SQFT_PER_ROBOT_DAY * targetDays * ROBOT_UTILIZATION))
    );

    const estimatedSavings = manualLaborCost - robotServiceCost;
    const savingsPercent = manualLaborCost > 0 ? (estimatedSavings / manualLaborCost) * 100 : 0;

    return {
      robotsNeeded: Math.min(robotsNeeded, 12),
      manualLaborCost: Math.round(manualLaborCost),
      robotServiceCost: Math.round(robotServiceCost),
      estimatedSavings: Math.round(estimatedSavings),
      savingsPercent: Math.round(savingsPercent),
      manualCrewDays,
    };
  };

  const results = calculateROI();
  const savingsPositive = results.estimatedSavings > 0;

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<number>>, min: number, max: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value) || 0;
      setter(Math.max(min, Math.min(val, max)));
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
                <div className="text-xs text-slate-500">Adjust to model your project</div>
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
                  onChange={handleInputChange(setSqft, 15000, 250000)}
                  className="w-full accent-[#F97316]"
                />
                <input type="number" value={sqft} onChange={handleInputChange(setSqft, 5000, 500000)} className="roi-input mt-2 w-full rounded-lg border px-4 py-2.5 text-sm font-mono" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium">Current Finish Crew Size</label>
                  <span className="font-mono text-[#F97316] font-semibold">{crewSize} people</span>
                </div>
                <input type="range" min="4" max="35" step="1" value={crewSize} onChange={handleInputChange(setCrewSize, 4, 35)} className="w-full accent-[#F97316]" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium">Fully Loaded Hourly Labor Cost</label>
                  <span className="font-mono text-[#F97316] font-semibold">${hourlyCost}/hr</span>
                </div>
                <input type="range" min="32" max="72" step="1" value={hourlyCost} onChange={handleInputChange(setHourlyCost, 32, 72)} className="w-full accent-[#F97316]" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium">Target Project Timeline</label>
                  <span className="font-mono text-[#F97316] font-semibold">{targetDays} days</span>
                </div>
                <input type="range" min="20" max="90" step="1" value={targetDays} onChange={handleInputChange(setTargetDays, 20, 90)} className="w-full accent-[#F97316]" />
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 px-1 leading-relaxed">
            <span className="font-medium text-slate-600">Model assumptions:</span> manual productivity of ~36 sqft per man-hour (published industry benchmarks), DryForge target rate of ${TARGET_RATE_PER_SQFT.toFixed(2)}/sqft all-in, and a design target of {TARGET_SQFT_PER_ROBOT_DAY} sqft/robot/day at {Math.round(ROBOT_UTILIZATION * 100)}% utilization. These are planning targets, not measured DryForge field data — validating them is the entire point of the founding pilot.
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="card p-8 h-full">
            <div className="uppercase text-xs tracking-[1.5px] font-bold text-emerald-600 mb-1">MODELED OUTCOMES</div>
            <div className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
              Your Project, Modeled <TrendingDown className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">MANUAL FINISHING COST</div>
                <div className="text-4xl font-bold tracking-[-1.5px] text-[#0F172A] mt-1 tabular-nums">{formatCurrency(results.manualLaborCost)}</div>
                <div className="text-xs text-slate-500 mt-1">≈ {results.manualCrewDays} working days for a crew of {crewSize}</div>
              </div>

              <div className="bg-white border rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">ROBOT-ASSISTED (TARGET RATE)</div>
                <div className="text-4xl font-bold tracking-[-1.5px] text-[#0F172A] mt-1 tabular-nums">{formatCurrency(results.robotServiceCost)}</div>
                <div className="text-xs text-slate-500 mt-1">at ${TARGET_RATE_PER_SQFT.toFixed(2)}/sqft all-in target</div>
              </div>

              <div className={`${savingsPositive ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"} border rounded-2xl p-5`}>
                <div className={`text-xs uppercase tracking-wider font-semibold ${savingsPositive ? "text-emerald-700" : "text-amber-700"}`}>MODELED {savingsPositive ? "SAVINGS" : "DIFFERENCE"}</div>
                <div className={`text-4xl font-bold tracking-[-1.5px] mt-1 tabular-nums ${savingsPositive ? "text-emerald-700" : "text-amber-700"}`}>{formatCurrency(results.estimatedSavings)}</div>
                <div className={`text-xs mt-1 ${savingsPositive ? "text-emerald-600/80" : "text-amber-600/80"}`}>{results.savingsPercent}% vs manual baseline</div>
              </div>

              <div className="bg-white border rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">ROBOTS IMPLIED</div>
                <div className="text-4xl font-bold tracking-[-1.5px] text-[#0F172A] mt-1 tabular-nums">{results.robotsNeeded}</div>
                <div className="text-xs text-slate-500 mt-1">to hit your {targetDays}-day timeline at design throughput</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3">
              <a href="#contact" className="btn-primary flex-1 justify-center text-sm py-3">Apply for the Founding Pilot</a>
              <a href="/pricing" className="btn-secondary flex-1 justify-center text-sm py-3">See Target Pricing Model</a>
            </div>

            <div className="text-[10px] text-center text-slate-400 mt-4">This is a planning model built on stated assumptions, not measured DryForge performance. Pilot projects exist to replace these estimates with real data.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
