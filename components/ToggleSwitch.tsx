import React from 'react';

interface ToggleSwitchProps {
  label: string;
  description: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  ariaLabel?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, enabled, setEnabled, ariaLabel }) => {
  return (
    <div
      onClick={() => setEnabled(!enabled)}
      className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel || label}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setEnabled(!enabled); } }}
    >
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary dark:focus-within:ring-offset-slate-800 ${enabled ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </div>
  );
};

export default ToggleSwitch;
