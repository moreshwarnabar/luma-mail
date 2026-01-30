export function formatEmailDate(date: Date | string | null): string {
  if (!date) return '';

  const d = new Date(date);
  const now = new Date();

  const isToday = d.toDateString() === now.toDateString();
  if (isToday)
    return d.toLocaleDateString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });

  if (d.getFullYear() === now.getFullYear())
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
