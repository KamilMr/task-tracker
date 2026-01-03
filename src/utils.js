const toSnakeCase = str => {
  return str
    .replace(/\s+/g, '_')
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase();
};

const toCamelCase = str => {
  return str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

export const convToSnake = obj => {
  return Object.keys(obj).reduce((pv, cv) => {
    pv[toSnakeCase(cv)] = obj[cv];
    return pv;
  }, {});
};

export const mapObjToSnake = (obj, keys) => {
  return keys.reduce((pv, cv) => {
    if (!obj[cv]) return pv;

    pv[cv] = obj[cv];
    return pv;
  }, {});
};

export const mapToCamel = obj => {
  return Object.keys(obj).reduce((pv, cv) => {
    pv[toCamelCase(cv)] = obj[cv];
    return pv;
  }, {});
};

export const retriveYYYYMMDD = (date = new Date()) =>
  date.toISOString().split('T')[0];

export const getFormatedDate = (now = new Date()) => {
  const date = now.toISOString().split('T')[0]; // format YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0]; // format HH:mm
  return `${date} ${time}`;
};

export const formatNumbToHHMMss = time => {
  const hours = parseInt(time / (60 * 60), 10);
  const minutes = parseInt((time % (60 * 60)) / 60, 10);
  const seconds = time % 60;

  return `${hours} h ${minutes} min ${seconds} sec`;
};

export const clearTerminal = () => {
  process.stdout.write('\x1Bc'); // This escape character clears the terminal
};

export const convToTss = (date = new Date()) => {
  return Math.floor(new Date(date).getTime() / 1000);
};

export const getDayOfWeek = (date = new Date()) => {
  return date.toLocaleDateString('en-En', {weekday: 'short'});
};

export const formatTime = seconds => {
  if (seconds === 0) return '';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatEstimation = minutes => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

// Time calculation utilities
export const calculateDuration = (start, end) => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return Math.floor((endTime - startTime) / 1000);
};

export const secondsToTimeObject = totalSeconds => ({
  hours: Math.floor(totalSeconds / 3600),
  minutes: Math.floor((totalSeconds % 3600) / 60),
  seconds: totalSeconds % 60,
  totalSeconds,
});

export const sumEntryDurations = entries => {
  return entries.reduce((total, entry) => {
    if (entry.start && entry.end)
      return total + calculateDuration(entry.start, entry.end);
    return total;
  }, 0);
};

// Analytics formatting utilities
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return null;
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatTimeDiff = seconds => {
  if (seconds === null || seconds === undefined) return null;
  const abs = Math.abs(seconds);
  const sign = seconds >= 0 ? '+' : '-';
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${sign}${hours}h ${minutes}m`;
  if (hours > 0) return `${sign}${hours}h`;
  if (minutes > 0) return `${sign}${minutes}m`;
  return `${sign}${abs}s`;
};

export const formatRelativeTime = date => {
  if (!date) return null;
  const now = new Date();
  const then = new Date(date);
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  const days = Math.floor(diffSeconds / 86400);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

export const formatHour = hour => {
  if (hour === null || hour === undefined) return null;
  const nextHour = (hour + 1) % 24;
  const formatH = h => {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  };
  return `${formatH(hour)}-${formatH(nextHour)}`;
};
