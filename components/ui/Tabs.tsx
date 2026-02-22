"use client";

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm 
                      font-medium border-b-2 transition-colors -mb-px
                      ${active === tab.key
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                      }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                          ${active === tab.key
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                          }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
