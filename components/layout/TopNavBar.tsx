import Link from "next/link";

export default function TopNavBar() {
  return (
    <header className="fixed top-0 right-0 h-[56px] w-full md:w-[calc(100%-260px)] z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-container-padding">
      <div className="flex-1 max-w-md hidden md:flex items-center relative">
        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          placeholder="Search markets, tickers..."
          className="w-full bg-surface-container border border-outline-variant rounded-lg py-1.5 pl-10 pr-4 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline-variant"
        />
      </div>
      <Link href="/dashboard" className="md:hidden flex items-center gap-2 hover:opacity-80">
        <span className="material-symbols-outlined text-primary">monitoring</span>
        <span className="text-headline-sm text-primary font-bold">Ticker Taka</span>
      </Link>
      <div className="flex items-center gap-6">
        <nav className="hidden lg:flex items-center gap-6">
          <a className="text-on-surface-variant pb-2 font-label-md text-label-md hover:text-primary transition-colors">
            Market Summary
          </a>
          <a className="text-on-surface-variant pb-2 font-label-md text-label-md hover:text-primary transition-colors">
            Today&apos;s Issues
          </a>
          <a className="text-on-surface-variant pb-2 font-label-md text-label-md hover:text-primary transition-colors">
            Recommended Debates
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
}
