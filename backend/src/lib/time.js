// India has no DST, so a fixed +05:30 offset is exact. Slots are generated/displayed in IST.
export const IST_OFFSET_MIN = 330;
const MS = 60000;

/** Wall-clock parts of an instant in IST. */
export function istParts(date) {
  const d = new Date(date.getTime() + IST_OFFSET_MIN * MS);
  return {
    year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
    hour: d.getUTCHours(), minute: d.getUTCMinutes(), weekday: d.getUTCDay(),
  };
}

/** Build the instant for an IST wall-clock time. */
export function istDate(year, month, day, hour = 0, minute = 0) {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MIN * MS);
}

export const ymd = (date) => {
  const p = istParts(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
};

export function formatSlot(date, locale = 'en-IN') {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date);
}
