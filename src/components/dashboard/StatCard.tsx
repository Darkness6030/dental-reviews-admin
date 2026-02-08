import React from "react";

type StatCardProps = {
  icon: React.ReactNode;
  value: any;
  label: string;
};

export const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
  return (
    <div className="bg-white rounded-3xl px-6 py-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 md:hidden lg:block">{icon}</div>
        <div>
          <div className="text-3xl font-semibold text-gray-900 leading-none">
            {value}
          </div>
          <div className="text-xs text-gray-500 mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
};
