import Image from "next/image"

import { Badge } from "@/src/components/ui/badge"

export function BrandPanel() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#0F2D6B] px-8 py-8 text-white lg:px-12 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(2,8,23,0.65),_transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,45,107,0.94),rgba(30,78,216,0.82))]" />
      <div className="absolute inset-0 opacity-35 mix-blend-screen">
        <Image
          src="/enterprise-office.svg"
          alt="Corporate office backdrop"
          fill
          priority
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-[#0F2D6B]/60" />

      <div className="relative z-10 flex h-full flex-col justify-between gap-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/12 shadow-lg shadow-slate-950/20 ring-1 ring-white/15 backdrop-blur">
              <div className="h-5 w-5 rounded-[0.4rem] bg-[linear-gradient(135deg,#fff,rgba(255,255,255,0.45))]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/80">
                HR Pro Pulse
              </p>
              <p className="text-sm text-blue-100/75">Enterprise workforce platform</p>
            </div>
          </div>
          <Badge className="border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] text-white shadow-none backdrop-blur">
            SOC 2 Type II Certified Security
          </Badge>
        </div>

        <div className="max-w-xl space-y-6">
          <Badge className="border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] font-medium text-white shadow-none backdrop-blur">
            Enterprise-ready access control
          </Badge>
          <div className="space-y-5">
            <h2 className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-tight text-white lg:text-[2.95rem]">
              Elevate your workforce management with precision.
            </h2>
            <p className="max-w-lg text-sm leading-6 text-blue-50/80 lg:text-base lg:leading-7">
              Join over 10,000+ global enterprises that rely on HR Pro Pulse for
              data-driven employee engagement, streamlined administration, and
              secure operational visibility.
            </p>
          </div>

          <div className="grid max-w-md grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 shadow-lg shadow-slate-950/15 backdrop-blur-md">
              <div className="text-2xl font-semibold">99.9%</div>
              <div className="mt-1 text-sm text-blue-50/75">Uptime SLA</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 shadow-lg shadow-slate-950/15 backdrop-blur-md">
              <div className="text-2xl font-semibold">24/7</div>
              <div className="mt-1 text-sm text-blue-50/75">Expert Support</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-end gap-3 text-white/75">
          <div className="rounded-full border border-white/10 bg-white/8 p-2.5 shadow-lg shadow-slate-950/10 backdrop-blur-md">
            <div className="size-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]" />
          </div>
          <div className="rounded-full border border-white/10 bg-white/8 p-2.5 shadow-lg shadow-slate-950/10 backdrop-blur-md">
            <div className="size-3 rounded-full bg-white/80" />
          </div>
        </div>
      </div>
    </div>
  )
}
