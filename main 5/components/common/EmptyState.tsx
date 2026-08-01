
import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl animate-fade-in-up">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
        {icon || <PackageOpen size={32} />}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2 font-heading">{title}</h3>
      <p className="text-gray-500 max-w-sm">{description}</p>
    </div>
  );
};
