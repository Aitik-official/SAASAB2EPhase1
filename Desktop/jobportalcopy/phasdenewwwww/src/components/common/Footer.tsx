export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between" style={{ fontFamily: 'Inter, sans-serif' }}>
        <p className="text-sm text-slate-600">© 2025 SAASA B2E.</p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Help
          </a>
        </div>
      </div>
    </footer>
  );
}







