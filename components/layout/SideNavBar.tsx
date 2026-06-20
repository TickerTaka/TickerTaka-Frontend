"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  disabled?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/debate", icon: "forum", label: "AI Debate" },
  { href: "/history", icon: "history", label: "Report History" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function SideNavBar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-[260px] bg-surface-container flex-col py-stack-lg z-50 shadow-sm border-r border-surface-container-low">
      <Link
        href="/dashboard"
        aria-label="대시보드로 이동"
        className="px-container-padding mb-8 flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
          TT
        </div>
        <div>
          <h1 className="text-headline-sm font-bold text-primary">Ticker Taka</h1>
          <p className="text-label-sm text-on-surface-variant">Stock Analysis</p>
        </div>
      </Link>

      <ul className="flex-1 flex flex-col gap-1 w-full mt-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          // 강한 호버: 우측 슬라이드 + primary 톤 + 아이콘 확대 + 좌측 강조 바
          const base =
            "group relative flex items-center gap-3 px-container-padding py-3 font-label-md text-label-md transition-all duration-150 ease-out";
          const cls = active
            ? `${base} text-primary border-r-4 border-primary bg-primary/10 font-bold`
            : `${base} text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:translate-x-1 hover:shadow-sm ${item.disabled ? "opacity-50 cursor-not-allowed hover:translate-x-0 hover:bg-transparent hover:text-on-surface-variant hover:shadow-none" : ""}`;

          if (item.disabled) {
            return (
              <li key={item.href}>
                <span className={cls}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </span>
              </li>
            );
          }
          return (
            <li key={item.href}>
              <Link href={item.href} className={cls}>
                {!active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1 rounded-r bg-primary transition-all duration-150 ease-out group-hover:h-2/3"
                  />
                )}
                <span
                  className={`material-symbols-outlined transition-transform duration-150 ${active ? "icon-fill" : "group-hover:scale-110"}`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-container-padding mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant/30">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface">Administrator</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
