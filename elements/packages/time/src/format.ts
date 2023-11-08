import de from '../locales/de.json';
import en from '../locales/en.json';
import kr from '../locales/kr.json';

const LOCALES: Record<
  string,
  {
    format: string;
    now: string;
    ago: string;
    second: string;
    seconds: string;
    minute: string;
    minutes: string;
    hour: string;
    hours: string;
    day: string;
    days: string;
  }
> = {
  en,
  de,
  kr,
};

const language = navigator.language || 'en-US';
export const intl = new Intl.DateTimeFormat(language, {
  dateStyle: 'full',
  timeStyle: 'medium',
});

export function formatDate(date) {
  return intl.format(date);
}

export function formatTime(time) {
  const lang = language.split('-')[0];
  const locales = LOCALES[lang];

  const delta = Date.now() - time;
  const s = Math.floor((delta / 1000) % 60);
  const m = Math.floor((delta / 1000 / 60) % 60);
  const h = Math.floor((delta / 1000 / 60 / 60) % 24);
  const d = Math.floor(delta / 1000 / 60 / 60 / 24);

  if (d > 6) {
    const fullDate = intl.format(new Date(time));

    return fullDate;
  }

  if (d > 1) {
    return locales.format
      .replace('%v', d.toString())
      .replace('%u', locales.days)
      .replace('%t', locales.ago);
  }
  if (d > 0) {
    return locales.format
      .replace('%v', d.toString())
      .replace('%u', locales.day)
      .replace('%t', locales.ago);
  }

  if (h > 1) {
    return locales.format
      .replace('%v', h.toString())
      .replace('%u', locales.hours)
      .replace('%t', locales.ago);
  }
  if (h > 0) {
    return locales.format
      .replace('%v', h.toString())
      .replace('%u', locales.hour)
      .replace('%t', locales.ago);
  }

  if (m > 1) {
    return locales.format
      .replace('%v', m.toString())
      .replace('%u', locales.minutes)
      .replace('%t', locales.ago);
  }
  if (m > 0) {
    return locales.format
      .replace('%v', m.toString())
      .replace('%u', locales.minute)
      .replace('%t', locales.ago);
  }

  if (s > 1) {
    return locales.format
      .replace('%v', s.toString())
      .replace('%u', locales.seconds)
      .replace('%t', locales.ago);
  }
  if (s > 0) {
    return locales.format
      .replace('%v', s.toString())
      .replace('%u', locales.second)
      .replace('%t', locales.ago);
  }

  return locales.now;
}
