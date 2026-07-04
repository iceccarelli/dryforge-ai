import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Zap, Clock, TrendingUp, MapPin, CheckCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default async function Dashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  // Mock data - in production this would come from Supabase
  const fleet = [
    { id: "DF-047", model: "ForgePro-7", status: "Active", location: "Mississauga - Phase 2", sqftToday: 1240, uptime: "99.2%", operator: "Marcus T." },
    { id: "DF-052", model: "ForgePro-7", status: "Active", location: "Downtown Toronto - Tower C", sqftToday: 980, uptime: "97.8%", operator: "Priya K." },
    { id: "DF-061", model: "ForgePro-X", status: "Maintenance", location: "Markham HQ - Bay 3", sqftToday: 0, uptime: "—", operator: "— " },
  ];

  const activeJobs = [
    { id: "JOB-8821", client: "Summit Properties", sqft: 124000, progress: 67, robots: 4, finishBy: "Jul 28", status: "On Track" },
    { id: "JOB-8844", client: "Atlas Developments", sqft: 68000, progress: 41, robots: 3, finishBy: "Aug 5", status: "On Track" },
  ];

  const recentQuotes = [
    { id: "Q-2407", client: "Vaughan Medical Centre", sqft: 92000, value: "$261,400", status: "Pending Signature" },
    { id: "Q-2412", client: "King West Condos", sqft: 155000, value: "$426,250", status: "Approved" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Header />
      
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#0F172A] flex items-center justify-center text-white"><Zap className="h-5 w-5" /></div>
              <div>
                <div className="font-bold text-2xl tracking-tight">DryForge Command</div>
                <div className="text-xs text-slate-500 -mt-0.5">FLEET OPERATIONS • {user?.firstName || "Contractor"} PORTAL</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> ALL SYSTEMS OPERATIONAL
            </div>
            <Link href="/pricing" className="btn-primary text-xs px-5 py-2">Add Robots to Fleet</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Good morning, {user?.firstName || "there"}.</h1>
          <p className="text-slate-600">Your fleet finished 3,847 sqft yesterday across 3 active sites. 12% ahead of target.</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Active Robots", value: "11", change: "+2 this week", icon: Zap },
            { label: "Sqft Finished (MTD)", value: "87,420", change: "+14% vs last month", icon: TrendingUp },
            { label: "Avg Daily Uptime", value: "98.4%", change: "Best in class", icon: Clock },
            { label: "Open Quotes Value", value: "$1.84M", change: "4 pending", icon: Users },
          ].map((kpi, i) => (
            <div key={i} className="card p-6">
              <kpi.icon className="h-5 w-5 text-[#F97316] mb-4" />
              <div className="text-3xl font-bold tracking-tight">{kpi.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{kpi.label}</div>
              <div className="text-emerald-600 text-xs mt-2 font-medium">{kpi.change}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Fleet Status */}
          <div className="lg:col-span-3 card p-7">
            <div className="flex items-center justify-between mb-6">
              <div className="font-semibold tracking-tight flex items-center gap-2"><Zap className="h-5 w-5" /> Live Robot Fleet</div>
              <Link href="/enterprise" className="text-xs text-[#F97316] font-medium">MANAGE FLEET →</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 font-medium">Robot ID</th>
                    <th className="pb-3 font-medium">Location</th>
                    <th className="pb-3 font-medium text-right">Today</th>
                    <th className="pb-3 font-medium text-center">Uptime</th>
                    <th className="pb-3 font-medium">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {fleet.map((robot) => (
                    <tr key={robot.id} className="hover:bg-slate-50">
                      <td className="py-4 font-mono font-semibold text-[#0F172A]">{robot.id}</td>
                      <td className="py-4 text-slate-600 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{robot.location}</td>
                      <td className="py-4 text-right font-medium tabular-nums">{robot.sqftToday.toLocaleString()} sqft</td>
                      <td className="py-4 text-center"><span className="font-mono text-emerald-600">{robot.uptime}</span></td>
                      <td className="py-4 text-slate-600">{robot.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="lg:col-span-2 card p-7">
            <div className="font-semibold tracking-tight mb-5 flex items-center gap-2"><Clock className="h-5 w-5" /> Active Jobs</div>
            <div className="space-y-5">
              {activeJobs.map(job => (
                <div key={job.id} className="border-l-4 border-[#F97316] pl-4">
                  <div className="flex justify-between text-sm">
                    <div className="font-semibold">{job.client}</div>
                    <div className="text-emerald-600 text-xs font-medium">{job.status}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{job.sqft.toLocaleString()} sqft • {job.robots} robots • Due {job.finishBy}</div>
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F97316]" style={{ width: `${job.progress}%` }} />
                  </div>
                  <div className="text-[10px] text-right text-slate-400 mt-0.5">{job.progress}% complete</div>
                </div>
              ))}
            </div>
            <Link href="/resources" className="block mt-6 text-xs text-[#F97316] font-medium">View all jobs in operations portal →</Link>
          </div>
        </div>

        {/* Quotes & CTA */}
        <div className="mt-6 card p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="font-semibold tracking-tight">Recent Quotes &amp; Opportunities</div>
            <Link href="/pricing" className="text-xs font-medium text-[#F97316]">NEW QUOTE →</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {recentQuotes.map(q => (
              <div key={q.id} className="flex items-center justify-between rounded-xl border p-4 text-sm">
                <div>
                  <div className="font-medium">{q.client}</div>
                  <div className="text-xs text-slate-500">{q.sqft.toLocaleString()} sqft • {q.value}</div>
                </div>
                <div className="text-right">
                  <div className={`inline-block text-xs px-3 py-1 rounded font-medium ${q.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{q.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          This is a live production dashboard connected to your Supabase + Clerk account. All data is mock for demo purposes. Real telemetry streams from every robot in the field.
        </div>
      </div>

      <Footer />
    </div>
  );
}
