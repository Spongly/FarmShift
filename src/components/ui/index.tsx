// ============================================================
// Shared UI Components for FarmShift Nepal
// ============================================================

import React from 'react';
import { clsx } from 'clsx';
import { Loader2, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

// ============================================================
// Button
// ============================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-forest text-white hover:bg-forest-600 active:bg-forest-700 focus-visible:outline-forest shadow-sm',
    secondary:
      'bg-paper-200 text-ink hover:bg-paper-300 active:bg-paper-300 focus-visible:outline-forest border border-paper-300',
    ghost:
      'text-ink hover:bg-paper-200 active:bg-paper-300 focus-visible:outline-forest',
    outline:
      'border border-forest text-forest hover:bg-forest-50 active:bg-forest-100 focus-visible:outline-forest',
    danger:
      'bg-sienna text-white hover:bg-sienna-600 active:bg-sienna-700 focus-visible:outline-sienna shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded',
    md: 'text-sm px-4 py-2 rounded',
    lg: 'text-base px-6 py-2.5 rounded',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
}

// ============================================================
// Card / Panel
// ============================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, as: Tag = 'div', padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  return (
    <Tag
      className={clsx(
        'bg-paper border border-paper-300 rounded',
        paddings[padding],
        className
      )}
    >
      {children}
    </Tag>
  );
}

// ============================================================
// Section Header
// ============================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  mono?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, mono, children, className }: SectionHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between gap-4', className)}>
      <div>
        {mono && <p className="data-annotation mb-1">{mono}</p>}
        <h2 className="text-lg font-semibold text-ink leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-ink-muted mt-0.5 leading-snug">{subtitle}</p>}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}

// ============================================================
// Status Badge
// ============================================================

interface StatusBadgeProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'warning';
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const styles = {
    idle: 'bg-stone-100 text-ink-muted',
    loading: 'bg-amber-50 text-amber',
    success: 'bg-forest-50 text-forest',
    error: 'bg-sienna-50 text-sienna',
    warning: 'bg-amber-50 text-amber',
  };

  const dots = {
    idle: <span className="status-dot-gray" />,
    loading: <Loader2 className="w-2.5 h-2.5 animate-spin" />,
    success: <span className="status-dot-green" />,
    error: <span className="status-dot-red" />,
    warning: <span className="status-dot-amber" />,
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
        styles[status],
        className
      )}
    >
      {dots[status]}
      {label}
    </span>
  );
}

// ============================================================
// Alert / Notice
// ============================================================

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function Alert({ type, title, children, className, onClose }: AlertProps) {
  const styles = {
    info: {
      container: 'bg-stone-50 border-stone-200 text-ink',
      icon: <Info className="w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-forest-50 border-forest-200 text-forest',
      icon: <CheckCircle className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber',
      icon: <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />,
    },
    error: {
      container: 'bg-sienna-50 border-sienna-200 text-sienna',
      icon: <XCircle className="w-4 h-4 text-sienna flex-shrink-0 mt-0.5" />,
    },
  };

  const s = styles[type];

  return (
    <div
      className={clsx(
        'flex gap-3 p-3 rounded border text-sm',
        s.container,
        className
      )}
      role="alert"
    >
      {s.icon}
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium mb-0.5">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================
// Loading Skeleton
// ============================================================

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton rounded', className)} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('space-y-2', className)} aria-busy="true" aria-label="Loading...">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

// ============================================================
// Score Bar
// ============================================================

interface ScoreBarProps {
  value: number; // 0-1
  label?: string;
  color?: 'green' | 'amber' | 'red' | 'neutral';
  showValue?: boolean;
  className?: string;
}

export function ScoreBar({ value, label, color, showValue = true, className }: ScoreBarProps) {
  const resolvedColor =
    color ??
    (value >= 0.7 ? 'green' : value >= 0.45 ? 'amber' : 'red');

  const barColors = {
    green: 'bg-forest-300',
    amber: 'bg-amber-300',
    red: 'bg-sienna-300',
    neutral: 'bg-stone-300',
  };

  const textColors = {
    green: 'text-forest',
    amber: 'text-amber',
    red: 'text-sienna',
    neutral: 'text-ink-muted',
  };

  const pct = Math.round(value * 100);

  return (
    <div className={clsx('space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-ink-secondary">{label}</span>}
          {showValue && (
            <span className={clsx('text-xs font-mono font-medium', textColors[resolvedColor])}>
              {pct}
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 bg-paper-300 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', barColors[resolvedColor])}
          style={{ width: `${Math.min(100, pct)}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ============================================================
// Tag / Chip
// ============================================================

interface TagProps {
  children: React.ReactNode;
  color?: 'green' | 'amber' | 'red' | 'neutral' | 'blue';
  size?: 'sm' | 'xs';
  className?: string;
}

export function Tag({ children, color = 'neutral', size = 'sm', className }: TagProps) {
  const colors = {
    green: 'bg-forest-50 text-forest border-forest-200',
    amber: 'bg-amber-50 text-amber border-amber-200',
    red: 'bg-sienna-50 text-sienna border-sienna-200',
    neutral: 'bg-stone-100 text-ink-secondary border-stone-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const sizes = {
    xs: 'text-2xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
  };

  return (
    <span
      className={clsx(
        'inline-block rounded border font-medium leading-none',
        colors[color],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================================
// Divider
// ============================================================

export function Divider({ className }: { className?: string }) {
  return <hr className={clsx('border-paper-300', className)} />;
}

// ============================================================
// Form components
// ============================================================

interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function Label({ htmlFor, children, required, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx('block text-sm font-medium text-ink-secondary mb-1', className)}
    >
      {children}
      {required && <span className="text-sienna ml-0.5" aria-label="required">*</span>}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <div>
      <input
        className={clsx(
          'w-full px-3 py-2 text-sm bg-paper border rounded text-ink placeholder:text-ink-subtle',
          'focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-sienna' : 'border-paper-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-sienna" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <div>
      <select
        className={clsx(
          'w-full px-3 py-2 text-sm bg-paper border rounded text-ink',
          'focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-sienna' : 'border-paper-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-xs text-sienna" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Tooltip wrapper (simple title-based)
// ============================================================

export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  return (
    <span title={content} className="cursor-help">
      {children}
    </span>
  );
}

// ============================================================
// Empty State
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="text-stone-300 mb-4" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-ink-secondary mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============================================================
// Source Attribution
// ============================================================

interface SourceNoteProps {
  source: string;
  date?: string;
  className?: string;
}

export function SourceNote({ source, date, className }: SourceNoteProps) {
  return (
    <p className={clsx('source-note', className)}>
      Source: {source}
      {date && ` · ${date}`}
    </p>
  );
}

// ============================================================
// Risk indicator
// ============================================================

interface RiskIndicatorProps {
  severity: 'low' | 'medium' | 'high';
  label: string;
  className?: string;
}

export function RiskIndicator({ severity, label, className }: RiskIndicatorProps) {
  const styles = {
    low: 'text-forest bg-forest-50',
    medium: 'text-amber bg-amber-50',
    high: 'text-sienna bg-sienna-50',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded', styles[severity], className)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', {
        'bg-forest-300': severity === 'low',
        'bg-amber-300': severity === 'medium',
        'bg-sienna-400': severity === 'high',
      })} />
      {label}
    </span>
  );
}
