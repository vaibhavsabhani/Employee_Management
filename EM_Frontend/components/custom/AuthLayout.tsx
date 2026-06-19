import { cn } from "@/lib/utils";
import { BrandPanel } from "./BrandPanel";

type AuthLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <main
      className={cn(
        "min-h-screen overflow-hidden bg-slate-950 text-white",
        className,
      )}
    >
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.9),transparent_42%)]" />
        <div className="relative grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
          <section className="flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="w-full max-w-xl">{children}</div>
          </section>
          <section className="relative min-h-120 lg:min-h-screen">
            <BrandPanel />
          </section>
        </div>
      </div>
    </main>
  );
}
