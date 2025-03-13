import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Label } from '@/components/ui/label';

interface ResponsiveFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

interface ResponsiveFormSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  columns?: 1 | 2;
  gap?: 'small' | 'default' | 'large';
}

interface ResponsiveFormFieldProps {
  children: ReactNode;
  className?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
}

interface ResponsiveFormRowProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'default' | 'large';
}

interface ResponsiveFormActionsProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

/**
 * A responsive form component that adapts well to different screen sizes.
 */
export function ResponsiveForm({
  children,
  className,
  compact = false,
  ...props
}: ResponsiveFormProps) {
  return (
    <form
      className={cn(
        'space-y-6',
        compact && 'space-y-4',
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
}

/**
 * A section component for the responsive form.
 */
export function ResponsiveFormSection({
  children,
  className,
  title,
  description,
  columns = 1,
  gap = 'default'
}: ResponsiveFormSectionProps) {
  const getGapClass = () => {
    switch (gap) {
      case 'small':
        return 'gap-4';
      case 'large':
        return 'gap-8';
      default:
        return 'gap-6';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={cn(
        columns === 2 && 'grid grid-cols-1 md:grid-cols-2',
        getGapClass()
      )}>
        {children}
      </div>
    </div>
  );
}

/**
 * A field component for the responsive form.
 */
export function ResponsiveFormField({
  children,
  className,
  label,
  description,
  error,
  required = false,
  fullWidth = false
}: ResponsiveFormFieldProps) {
  return (
    <div className={cn(
      'space-y-2',
      fullWidth ? 'col-span-full' : '',
      className
    )}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {description && (
            <span className="text-xs text-muted-foreground hidden sm:inline-block">{description}</span>
          )}
        </div>
      )}
      {description && (
        <span className="text-xs text-muted-foreground sm:hidden">{description}</span>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

/**
 * A row component for the responsive form to arrange fields horizontally.
 */
export function ResponsiveFormRow({
  children,
  className,
  columns = 2,
  gap = 'default'
}: ResponsiveFormRowProps) {
  const getGapClass = () => {
    switch (gap) {
      case 'small':
        return 'gap-2 sm:gap-3';
      case 'large':
        return 'gap-6 sm:gap-8';
      default:
        return 'gap-4 sm:gap-6';
    }
  };

  const getColumnsClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 3:
        return 'grid-cols-1 sm:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
      case 2:
      default:
        return 'grid-cols-1 sm:grid-cols-2';
    }
  };

  return (
    <div
      className={cn(
        'grid',
        getColumnsClass(),
        getGapClass(),
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A component for form actions like submit and cancel buttons.
 */
export function ResponsiveFormActions({
  children,
  className,
  align = 'right'
}: ResponsiveFormActionsProps) {
  const getAlignClass = () => {
    switch (align) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'between':
        return 'justify-between';
      case 'right':
      default:
        return 'justify-end';
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row gap-3 pt-2 mt-6',
        getAlignClass(),
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A responsive form layout with a two-column grid for larger screens.
 */
export function ResponsiveFormLayout({
  children,
  className,
  title,
  description,
  compact = false,
  ...props
}: ResponsiveFormProps & {
  title?: string;
  description?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      <ResponsiveForm compact={compact} {...props}>
        {children}
      </ResponsiveForm>
    </div>
  );
}

export default ResponsiveForm; 