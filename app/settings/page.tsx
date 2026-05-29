"use client";

import { useTheme } from "@/components/layout/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const options: { value: "light" | "dark"; label: string; desc: string; icon: string }[] = [
    { value: "light", label: "라이트", desc: "밝은 화면 (기본)", icon: "light_mode" },
    { value: "dark", label: "다크", desc: "어두운 화면", icon: "dark_mode" },
  ];

  return (
    <div className="p-container-padding flex flex-col gap-stack-lg max-w-3xl mx-auto">
      <header>
        <h2 className="text-headline-lg text-on-surface mb-1">설정</h2>
        <p className="text-body-md text-on-surface-variant">화면 테마와 환경을 설정합니다.</p>
      </header>

      {/* Theme */}
      <section className="bg-card-bg border border-card-border rounded-card shadow-deep-soft p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-headline-sm text-on-surface mb-1">화면 테마</h3>
          <p className="text-body-sm text-on-surface-variant">라이트 / 다크 모드를 선택하세요.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {options.map((o) => {
            const active = theme === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setTheme(o.value)}
                className={`flex flex-col items-start gap-2 p-4 rounded-btn border-2 transition-colors text-left ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-card-border hover:border-outline bg-surface-container"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${active ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {o.icon}
                </span>
                <div>
                  <p className={`text-label-md ${active ? "text-primary" : "text-on-surface"}`}>{o.label}</p>
                  <p className="text-label-sm text-on-surface-variant">{o.desc}</p>
                </div>
                {active && (
                  <span className="text-label-sm text-primary flex items-center gap-0.5 mt-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> 사용 중
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Color guide */}
      <section className="bg-card-bg border border-card-border rounded-card shadow-deep-soft p-6 flex flex-col gap-4">
        <h3 className="text-headline-sm text-on-surface">색상 안내</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-body-md text-on-surface">상승</span>
            <span className="px-3 py-1 rounded-full text-label-md bg-positive/10 text-positive font-bold">
              ▲ 빨강
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-md text-on-surface">하락</span>
            <span className="px-3 py-1 rounded-full text-label-md bg-negative/10 text-negative font-bold">
              ▼ 파랑
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
