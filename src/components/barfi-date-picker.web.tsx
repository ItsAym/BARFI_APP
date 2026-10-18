import { createElement } from 'react';
import type { ChangeEvent } from 'react';

type Props = {
  value: Date;
  mode?: string;
  onChange?: (event: {
    type: 'set';
    nativeEvent: { timestamp: number; utcOffset: number };
  }, date?: Date) => void;
};

export default function WebDateTimePicker({ value, mode, onChange }: Props) {
  const isTime = mode === 'time';
  const date = [value.getFullYear(), String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0')].join('-');
  const time = [String(value.getHours()).padStart(2, '0'),
    String(value.getMinutes()).padStart(2, '0')].join(':');

  return createElement('input', {
    type: isTime ? 'time' : 'date',
    value: isTime ? time : date,
    'aria-label': isTime ? 'Velg tidspunkt' : 'Velg dato',
    step: isTime ? 60 : undefined,
    style: {
      width: '100%', minHeight: 52, boxSizing: 'border-box',
      marginTop: 12, padding: 12, border: '1px solid #DDD0D6',
      borderRadius: 12, backgroundColor: '#FFFFFF', color: '#30232A',
      fontFamily: 'inherit', fontSize: 16, colorScheme: 'light',
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value;
      if (!text) return;
      const next = new Date(value);
      if (isTime) {
        const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(text);
        if (!match) return;
        next.setHours(Number(match[1]), Number(match[2]), 0, 0);
      } else {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
        if (!match) return;
        const year = Number(match[1]), month = Number(match[2]) - 1, day = Number(match[3]);
        next.setFullYear(year, month, day);
        if (next.getFullYear() !== year || next.getMonth() !== month || next.getDate() !== day) return;
      }
      if (!Number.isNaN(next.getTime())) onChange?.({
        type: 'set', nativeEvent: { timestamp: next.getTime(), utcOffset: -next.getTimezoneOffset() },
      }, next);
    },
  });
}
