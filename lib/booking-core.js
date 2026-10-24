(function (root) {
  function validDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const [year, month, day] = date.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
  }

  function validTime(time) {
    return typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  }

  function validateBooking(booking, options) {
    if (!booking || !options) return false;
    const textFields = ['project', 'person', 'printer', 'start', 'purpose', 'filament', 'filamentColor'];
    if (!textFields.every(key => typeof booking[key] === 'string' && booking[key].trim())) return false;
    const duration = Number(booking.duration);
    return validDate(booking.date) && validTime(booking.start) && Number.isFinite(duration) && duration >= 0.0001 && duration <= 48 &&
      options.purposes?.includes(booking.purpose) && options.filaments?.includes(booking.filament) && options.colors?.includes(booking.filamentColor);
  }

  function timestamp(date, time) {
    if (!validDate(date) || !validTime(time)) return NaN;
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    return Date.UTC(year, month - 1, day, hour, minute);
  }

  function intervalsOverlap(dateA, timeA, durationA, dateB, timeB, durationB) {
    const startA = timestamp(dateA, timeA), startB = timestamp(dateB, timeB);
    if (!Number.isFinite(startA) || !Number.isFinite(startB)) return false;
    const endA = startA + Number(durationA) * 3600000, endB = startB + Number(durationB) * 3600000;
    return startA < endB && startB < endA;
  }

  function isCurrentOrFuture(booking, now = Date.now(), fallbackDate) {
    if (!booking || booking.status === 'Complete') return false;
    const date = booking.date || fallbackDate;
    const start = new Date(`${date}T${String(booking.start || '').slice(0, 5)}:00`).getTime();
    const duration = Number(booking.duration);
    if (!Number.isFinite(start) || !Number.isFinite(duration) || duration <= 0) return true;
    return start + duration * 3600000 > now;
  }

  root.PrintBooking = { validDate, validTime, validateBooking, intervalsOverlap, isCurrentOrFuture };
})(globalThis);

