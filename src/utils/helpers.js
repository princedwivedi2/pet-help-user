export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const date = new Date();
  date.setHours(+h, +m);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const intervals = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.unit}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

export function truncate(str, len = 100) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

/**
 * Extract an array from API response.
 * Handles: { success, data: { key: [...] } } wrappers and direct axios responses.
 */
export function apiList(response, key) {
  if (Array.isArray(response)) return response;
  if (key && Array.isArray(response?.[key])) return response[key];
  const inner = response?.data;
  if (key && Array.isArray(inner?.[key])) return inner[key];
  const deeper = inner?.data;
  if (key && Array.isArray(deeper?.[key])) return deeper[key];
  if (Array.isArray(inner)) return inner;
  return [];
}

/**
 * Extract a single object from API response.
 */
export function apiObject(response, key) {
  if (!response) return null;
  if (key && response[key] != null) return response[key];
  const inner = response?.data;
  if (key && inner?.[key] != null) return inner[key];
  const deeper = inner?.data;
  if (key && deeper?.[key] != null) return deeper[key];
  return inner || response;
}

/**
 * Extract pagination from API response.
 */
export function apiPagination(response) {
  return response?.pagination ||
    response?.data?.pagination ||
    response?.data?.data?.pagination ||
    { current_page: 1, last_page: 1 };
}
