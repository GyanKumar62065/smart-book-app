import AuthButton from "@/components/AuthButton";
import AuthListener from "@/components/AuthListener";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuthListener />
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[128px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo / Brand */}
        <div className="mb-8 animate-float">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl shadow-purple-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-7xl font-bold text-center mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Smart
          </span>
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mark
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/50 text-lg sm:text-xl text-center max-w-md mb-4">
          Your bookmarks, everywhere. Real-time sync across all your devices.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["Real-time Sync", "Private & Secure", "Lightning Fast"].map((feature) => (
            <span
              key={feature}
              className="px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 text-sm"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Sign in button */}
        <AuthButton mode="signin" />

        {/* Footer */}
        <p className="absolute bottom-8 text-white/20 text-sm">
          Built with Next.js, Supabase & Tailwind CSS
        </p>
      </div>
    </div>
  );
}
