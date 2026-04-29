export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-primary font-mono text-xs font-semibold tracking-widest uppercase">
          PWA Probe
        </span>
        <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
          Browser Capability Scanner
        </h1>
        <p className="text-muted-foreground max-w-md text-base">
          See exactly what your browser can do as a PWA. ~80 API checks, a score, and a shareable
          report.
        </p>
      </div>
    </main>
  );
}
