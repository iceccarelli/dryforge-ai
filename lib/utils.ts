import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-CA").format(num);
}

export function calculatePaybackPeriod(investment: number, monthlySavings: number): number {
  if (monthlySavings <= 0) return Infinity;
  return Math.ceil(investment / monthlySavings);
}
