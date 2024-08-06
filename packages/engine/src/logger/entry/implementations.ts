import { AbstractLogEntry } from './abstract';
import {
  LogLevel,
  TDirPayload,
  TErrorPayload,
  TMessagePayload,
  TTimingPayload
} from './types';

export class DebugEntry extends AbstractLogEntry<TMessagePayload> {
  readonly type = 'DEBUG' as const;
  readonly level = LogLevel.VERBOSE as const;
}

export class InfoEntry extends AbstractLogEntry<TMessagePayload> {
  readonly type = 'INFO' as const;
  readonly level = LogLevel.INFO as const;
}

export class LogEntry extends AbstractLogEntry<TMessagePayload> {
  readonly type = 'LOG' as const;
  readonly level = LogLevel.INFO as const;
}

export class WarnEntry extends AbstractLogEntry<TMessagePayload> {
  readonly type = 'WARN' as const;
  readonly level = LogLevel.WARNING as const;
}

export class ErrorEntry extends AbstractLogEntry<TErrorPayload> {
  readonly type = 'ERROR' as const;
  readonly level = LogLevel.ERROR as const;
}

export class DirEntry extends AbstractLogEntry<TDirPayload> {
  readonly type = 'DIR' as const;
  readonly level = LogLevel.INFO as const;
}

export class AssertionEntry extends AbstractLogEntry<TMessagePayload> {
  readonly type = 'ASSERTION' as const;
  readonly level = LogLevel.ERROR as const;
}

export class TimeEndEntry extends AbstractLogEntry<TTimingPayload> {
  readonly type = 'TIME_END' as const;
  readonly level = LogLevel.INFO as const;
}
