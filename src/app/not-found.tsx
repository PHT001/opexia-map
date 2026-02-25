export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-[64px] font-black text-white/10 leading-none">404</h1>
        <p className="text-[14px] text-text-muted mt-2">Page introuvable</p>
        <a
          href="/"
          className="inline-block mt-4 px-4 py-2 rounded-xl text-[12px] font-medium text-text-muted hover:text-text transition-colors"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          ← Retour au dashboard
        </a>
      </div>
    </div>
  );
}
