"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SolutionProfile = {
  id: string
  name: string
  seats: string
  badge: string
  description: string
  specs: {
    backbone: string
    wifi: string
    poeBudget: string
    concurrentUsers: string
  }
  recommendedStack: {
    gateway: string
    switches: string
    accessPoints: string
    workstations: string
    racksAndPower: string
  }
  estimatedBudget: string
}

const PROFILES: SolutionProfile[] = [
  {
    id: "office-small",
    name: "Small Business / Startup",
    seats: "5 - 25 Users",
    badge: "FAST DEPLOYMENT",
    description: "Compact, silent multi-gigabit network with seamless WiFi 7 coverage and ultra-reliable cloud management.",
    specs: {
      backbone: "2.5GbE LAN + 1G WAN",
      wifi: "WiFi 7 Tri-Band (Up to 5.8 Gbps)",
      poeBudget: "180W PoE+ (Phones, APs, Cameras)",
      concurrentUsers: "Up to 50 active devices",
    },
    recommendedStack: {
      gateway: "Multi-WAN Security Gateway with Hardware VPN & Failover",
      switches: "16-Port 2.5G Managed Switch with 8x PoE+ (30W/port)",
      accessPoints: "2x High-Density WiFi 7 Wall/Ceiling APs",
      workstations: "Lenovo ThinkPad T14 Gen 5 or Dell Latitude 5440",
      racksAndPower: "9U Wall-Mount Enclosure + 1500VA Smart Line-Interactive UPS",
    },
    estimatedBudget: "$3,200 - $6,500 turnkey",
  },
  {
    id: "office-medium",
    name: "Corporate Enterprise Office",
    seats: "25 - 100 Users",
    badge: "HIGH REDUNDANCY",
    description: "Multi-gigabit backbone with 10G fiber uplinks, segregated guest/corporate VLANs, and redundant failover.",
    specs: {
      backbone: "10GbE SFP+ Fiber Core + 2.5GbE Edge",
      wifi: "Enterprise WiFi 7 / 6E Zero-Handoff Mesh",
      poeBudget: "740W PoE++ (High-Density & PTZ)",
      concurrentUsers: "Up to 300 active devices",
    },
    recommendedStack: {
      gateway: "Enterprise Next-Gen Threat Gateway (IDS/IPS 3.5Gbps)",
      switches: "2x 48-Port Layer-3 Gigabit / 2.5G PoE+ Switches with 10G SFP+ Uplinks",
      accessPoints: "6x Enterprise Ceiling WiFi 7 APs with Cloud Controller",
      workstations: "Lenovo ThinkPad X1 Carbon Gen 12 & MacBook Pro 14 M3 Pro",
      racksAndPower: "24U 19\" Server Rack, Shielded Cat6A Patch Panels, 3000VA Online UPS",
    },
    estimatedBudget: "$12,000 - $28,000 turnkey",
  },
  {
    id: "warehouse-campus",
    name: "Campus & Logistics Warehouse",
    seats: "100+ Users & Large Premises",
    badge: "HIGH-RANGE INFRASTRUCTURE",
    description: "Heavy-duty outdoor and indoor wireless coverage, fiber optic runs between buildings, and industrial DIN-rail switches.",
    specs: {
      backbone: "25G/10G Fiber Optic Interconnect",
      wifi: "Long-Range Outdoor APs + High-Gain Directional Links",
      poeBudget: "1500W+ Distributed High-Power PoE++",
      concurrentUsers: "1,000+ devices, scanners & IoT",
    },
    recommendedStack: {
      gateway: "High-Availability Redundant Dual-Gateway Cluster",
      switches: "Aggregation Fiber Switch + 4x Industrial Managed 24-Port PoE++",
      accessPoints: "12x Long-Range IP67 Outdoor & Warehouse Access Points",
      workstations: "MIL-STD 810H Rugged Laptops & Dell Precision 5690 Workstations",
      racksAndPower: "42U Server Cabinet, Redundant A+B Dual ATS PDUs, Modular On-Line UPS",
    },
    estimatedBudget: "Custom Enterprise Quote",
  },
  {
    id: "studio-creative",
    name: "Creative Studio & Media Production",
    seats: "10 - 40 Power Creators",
    badge: "ULTRA-LOW LATENCY",
    description: "Pure 10GbE / 25GbE copper and fiber network built for simultaneous 4K/8K video editing and high-speed NAS access.",
    specs: {
      backbone: "10GbE Full Line-Rate to Every Desk",
      wifi: "WiFi 7 320MHz Ultra-Wide Channels",
      poeBudget: "370W PoE+ with Active Fan Cooling",
      concurrentUsers: "Petabyte NVMe file transfers",
    },
    recommendedStack: {
      gateway: "10G Multi-WAN Router with Dedicated SFP+ WAN",
      switches: "24-Port Full 10GbE Managed Switch (16x 10GBase-T + 8x SFP+)",
      accessPoints: "3x Ultra-Fast WiFi 7 APs for mobile workstations",
      workstations: "Apple MacBook Pro 16 M3 Max & Dell Precision Mobile Workstations",
      racksAndPower: "Synology 8-Bay 10GbE All-Flash NAS + 18U Soundproof Rack",
    },
    estimatedBudget: "$8,500 - $19,000 turnkey",
  },
]

export default function NetworkSolutionConfigurator() {
  const [activeProfileId, setActiveProfileId] = useState<string>("office-small")
  const activeProfile = PROFILES.find((p) => p.id === activeProfileId) || PROFILES[0]

  return (
    <section className="bg-slate-900 text-white py-16 sm:py-20 border-y border-slate-800 relative overflow-hidden" id="network-configurator">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="content-container relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[11px] font-mono uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Interactive Hardware Architecture Configurator
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Design the optimal network &amp; computing stack for your premises.
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Select your organisation size and workload below. Our configuration engine calculates recommended switches, gateways, WiFi access points, and workstation laptops.
          </p>
        </div>

        {/* Profile Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {PROFILES.map((profile) => {
            const isActive = profile.id === activeProfileId
            return (
              <button
                key={profile.id}
                onClick={() => setActiveProfileId(profile.id)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-950/50 ring-1 ring-blue-500"
                    : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-blue-400 uppercase">
                    {profile.badge}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300"
                  }`}>
                    {profile.seats}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {profile.name}
                </h3>
              </button>
            )
          })}
        </div>

        {/* Main Configuration Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Left 7 Columns: Architecture & Recommended Stack */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {activeProfile.name} Topology
                  </h3>
                  <span className="text-xs font-mono font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-400/20">
                    {activeProfile.seats}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  {activeProfile.description}
                </p>
              </div>

              {/* Hardware Stack Breakdown */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block">
                  Recommended Equipment Stack
                </span>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                      GW
                    </span>
                    <div>
                      <span className="font-bold text-white block">Security Gateway &amp; Firewall</span>
                      <span className="text-slate-400">{activeProfile.recommendedStack.gateway}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                      SW
                    </span>
                    <div>
                      <span className="font-bold text-white block">Managed Switching Fabric</span>
                      <span className="text-slate-400">{activeProfile.recommendedStack.switches}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                      AP
                    </span>
                    <div>
                      <span className="font-bold text-white block">Wireless Access &amp; WiFi 7</span>
                      <span className="text-slate-400">{activeProfile.recommendedStack.accessPoints}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                      PC
                    </span>
                    <div>
                      <span className="font-bold text-white block">Client Workstations &amp; Laptops</span>
                      <span className="text-slate-400">{activeProfile.recommendedStack.workstations}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-amber-600/20 text-amber-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                      RK
                    </span>
                    <div>
                      <span className="font-bold text-white block">Racks, Cabling &amp; Clean Power</span>
                      <span className="text-slate-400">{activeProfile.recommendedStack.racksAndPower}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Live Calculated Metrics & Action Box */}
            <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-800 p-6 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 block mb-1">
                  System Specifications Matrix
                </span>
                <h4 className="text-base font-bold text-white">
                  Performance &amp; Capacity Indicators
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">BACKBONE SPEED</span>
                  <span className="text-xs font-bold text-white block mt-1">{activeProfile.specs.backbone}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">WIRELESS RATING</span>
                  <span className="text-xs font-bold text-cyan-400 block mt-1">{activeProfile.specs.wifi}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">POE POWER BUDGET</span>
                  <span className="text-xs font-bold text-emerald-400 block mt-1">{activeProfile.specs.poeBudget}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">CONCURRENT DEVICES</span>
                  <span className="text-xs font-bold text-white block mt-1">{activeProfile.specs.concurrentUsers}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Estimated Solution Cost:</span>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    {activeProfile.estimatedBudget}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Includes hardware supply, initial staging, pre-configuration and warranty. On-site installation quoted separately.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <LocalizedClientLink
                  href={`/it-solutions?preset=${encodeURIComponent(activeProfile.name)}#request-quote`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-blue-950/40"
                >
                  <span>Request Custom BOM Quotation</span>
                  <span aria-hidden="true">&rarr;</span>
                </LocalizedClientLink>

                <LocalizedClientLink
                  href="/shop"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
                >
                  <span>Browse Individual Components</span>
                  <span aria-hidden="true">&rarr;</span>
                </LocalizedClientLink>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <span className="text-blue-400">&bull;</span> Tier-1 Authorized Hardware
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-400">&bull;</span> Next-Day Dispatch
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
