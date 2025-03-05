import React, { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  icon,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {icon && <span className="md:hidden">{icon}</span>}
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2 ml-auto">{actions}</div>}
    </div>
  );
};

export default AdminPageHeader; 