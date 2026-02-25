export function formatCurrency(value: number | undefined | null, compact = false): string {
  if (value === undefined || value === null) return '—';
  if (value === 0) return '$0';
  
  if (compact) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${Math.round(value)}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | undefined | null, compact = false): string {
  if (value === undefined || value === null) return '—';
  if (value === 0) return '0';
  
  if (compact) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return `${Math.round(value)}`;
  }
  
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatMultiple(value: number | undefined | null): string {
  if (value === undefined || value === null) return '—';
  return `${value.toFixed(1)}x`;
}

export function getGrowthColor(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'text-text-muted';
  if (value > 10) return 'text-green';
  if (value > 0) return 'text-green/70';
  if (value === 0) return 'text-text-muted';
  if (value > -10) return 'text-red/70';
  return 'text-red';
}

export function getCountryFlag(code: string | undefined): string {
  if (!code) return '';
  const codePoints = [...code.toUpperCase()].map(
    char => 0x1f1e6 + char.charCodeAt(0) - 65
  );
  return String.fromCodePoint(...codePoints);
}

export function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}
