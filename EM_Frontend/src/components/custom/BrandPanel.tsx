import Image from "next/image";

export function BrandPanel() {
  return (
    <div className="relative flex h-full min-h-screen flex-col overflow-hidden text-white">
      <Image
        src="/fintech.png"
        alt="Aksharam Fintech"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
      <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        {/* Logo in upper-left dark space */}
        <div className="flex justify-start -mt-15">
          <Image
            src="/fintech-logo.png"
            alt="Aksharam Fintech Logo"
            width={400}
            height={70}
            priority
            className="w-40 sm:w-56 lg:w-72 h-auto object-contain object-left"
          />
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs sm:max-w-sm">
          Empowering teams with smart workforce management solutions.
        </p>
      </div>
    </div>
  );
}
