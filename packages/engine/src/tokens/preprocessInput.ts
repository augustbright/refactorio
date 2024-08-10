import { ErrorManager } from 'src/errors';
import { EMPTY_LOCATION } from 'src/utils/location/emptyLocation';

export function preprocessInput(code: string): string {
  if (!code) return '';
  const match = code.match(
    /^(?<emptyStart>\s*\n)?(?<baseIndentation>\s*)(?<codeContent>\S(\s|\S)*?)(?<emptyEnd>\s*)$/
  );
  if (!match) {
    ErrorManager.throw(
      new SyntaxError('Failed to parse the input'),
      EMPTY_LOCATION
    );
  }
  const { groups } = match;
  if (!groups) {
    ErrorManager.throw(
      new SyntaxError('Failed to parse the input'),
      EMPTY_LOCATION
    );
  }
  const { baseIndentation, codeContent } = groups;
  return (baseIndentation + codeContent)
    .replaceAll(/^\s*$/gm, '')
    .split('\n')
    .map((line: string) => line.trimEnd())
    .map((line: string, idx: number) => {
      if (!line) return line;
      if (line.startsWith(baseIndentation)) {
        return line.slice(baseIndentation.length);
      }
      ErrorManager.throw(new SyntaxError('Broken indentation'), {
        column: 0,
        end: 0,
        start: 0,
        line: idx + 1
      });
    })
    .join('\n');
}
