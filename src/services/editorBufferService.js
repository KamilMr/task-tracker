import {writeFileSync, readFileSync, unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {format} from 'date-fns';
import {TZDate} from '@date-fns/tz';
import {getTimezone} from '../utils.js';

const ENTRY_REGEX = /^\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*$/;
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const formatBuffer = (entries, taskTitle) => {
  const lines = [
    `# Task: ${taskTitle}`,
    '#',
    '# Edit times below. Lines starting with # are ignored.',
    '# Format: ID | Task | YYYY-MM-DD HH:mm:ss | YYYY-MM-DD HH:mm:ss',
    '# Delete a line to remove the entry.',
    '# Abort with :cq (quit without saving).',
    '#',
  ];

  for (const entry of entries) {
    const startStr = format(entry.start, 'yyyy-MM-dd HH:mm:ss');
    const endStr = entry.end
      ? format(entry.end, 'yyyy-MM-dd HH:mm:ss')
      : 'Running...';
    const title = entry.title || taskTitle;
    lines.push(`${entry.id} | ${title} | ${startStr} | ${endStr}`);
  }

  return lines.join('\n') + '\n';
};

const parseDateTimeStr = str => {
  const [datePart, timePart] = str.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new TZDate(year, month - 1, day, hour, minute, second, getTimezone());
};

const validateDateTime = str => {
  if (!DATETIME_REGEX.test(str))
    return 'Invalid format, expected YYYY-MM-DD HH:mm:ss';

  const [datePart, timePart] = str.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  if (month < 1 || month > 12) return `Invalid month: ${month}`;
  if (day < 1 || day > 31) return `Invalid day: ${day}`;
  if (hour < 0 || hour > 23) return `Invalid hour: ${hour}`;
  if (minute < 0 || minute > 59) return `Invalid minute: ${minute}`;
  if (second < 0 || second > 59) return `Invalid second: ${second}`;

  return null;
};

export const parseBuffer = content => {
  const lines = content.split('\n');
  const entries = [];
  const errors = [];
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(ENTRY_REGEX);
    if (!match) {
      errors.push(`Line ${lineNum}: Cannot parse "${trimmed}"`);
      continue;
    }

    const id = parseInt(match[1], 10);
    const startStr = match[3].trim();
    const endStr = match[4].trim();
    const isRunning = endStr === 'Running...';

    const startErr = validateDateTime(startStr);
    if (startErr) {
      errors.push(`Line ${lineNum}: Start — ${startErr}`);
      continue;
    }

    if (!isRunning) {
      const endErr = validateDateTime(endStr);
      if (endErr) {
        errors.push(`Line ${lineNum}: End — ${endErr}`);
        continue;
      }

      const start = parseDateTimeStr(startStr);
      const end = parseDateTimeStr(endStr);
      if (start >= end) {
        errors.push(`Line ${lineNum}: Start time must be before end time`);
        continue;
      }
    }

    entries.push({id, startStr, endStr: isRunning ? null : endStr});
  }

  return {entries, errors};
};

export const diffEntries = (originalEntries, parsedEntries) => {
  const parsedMap = new Map(parsedEntries.map(e => [e.id, e]));
  const updates = [];
  const deletes = [];

  for (const original of originalEntries) {
    const parsed = parsedMap.get(original.id);

    if (!parsed) {
      deletes.push(original.id);
      continue;
    }

    const originalStartStr = format(original.start, 'yyyy-MM-dd HH:mm:ss');
    const originalEndStr = original.end
      ? format(original.end, 'yyyy-MM-dd HH:mm:ss')
      : null;

    const startChanged = parsed.startStr !== originalStartStr;
    const endChanged = parsed.endStr !== originalEndStr;

    if (startChanged || endChanged) {
      const update = {id: original.id};
      if (startChanged) update.start = parseDateTimeStr(parsed.startStr);
      if (endChanged)
        update.end = parsed.endStr ? parseDateTimeStr(parsed.endStr) : null;
      updates.push(update);
    }
  }

  return {updates, deletes};
};

export const openEditorForEntries = (entries, taskTitle) => {
  const tmpFile = join(tmpdir(), `tirith-entries-${Date.now()}.txt`);
  const editor = process.env.EDITOR || 'nvim';

  writeFileSync(tmpFile, formatBuffer(entries, taskTitle));

  try {
    while (true) {
      process.stdin.setRawMode(false);
      const result = spawnSync(editor, [tmpFile], {stdio: 'inherit'});
      process.stdin.setRawMode(true);

      if (result.error || result.status !== 0) return null;

      const edited = readFileSync(tmpFile, 'utf-8');
      const {entries: parsed, errors} = parseBuffer(edited);

      if (errors.length === 0) return diffEntries(entries, parsed);

      const errorHeader = errors.map(e => `# ERROR: ${e}`).join('\n');
      const cleanContent = edited
        .split('\n')
        .filter(l => !l.trim().startsWith('# ERROR:'))
        .join('\n');
      writeFileSync(tmpFile, errorHeader + '\n' + cleanContent);
    }
  } finally {
    try {
      unlinkSync(tmpFile);
    } catch {}
  }
};
