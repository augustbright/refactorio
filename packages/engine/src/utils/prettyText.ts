import {
  TCommonNode,
  TSelectorPattern
} from '@refactorio/engine/src/types/ast';

import { UnreachableCaseError } from './UnreachableCaseError';

import { TBinaryExpressionOperatorTokenType } from 'src/tokens/types';

const OPERATOR_VIEW: Record<TBinaryExpressionOperatorTokenType, string> = {
  PLUS: '+',
  MINUS: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  EQUALITY: '==',
  UNEQUALITY: '!=',
  AND: 'AND',
  OR: 'OR',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>='
};

const printSelector = (selector: TSelectorPattern[], level: number) =>
  selector.map((child) => prettyText(child, level + 1)).join(' ');

export const prettyText = (node: TCommonNode, level: number): string => {
  switch (node.type) {
    case 'Program':
      return node.body.map((child) => prettyText(child, level)).join(';');
    case 'VariableDeclaration':
      return `SET ${node.name} = ${prettyText(node.value, level)}`;
    case 'IfStatement':
      return [
        `IF ${prettyText(node.condition, level)} ${prettyText(node.statement, level)}`,
        node.elseStatement
          ? `ELSE ${prettyText(node.elseStatement, level)}`
          : null
      ]
        .filter(Boolean)
        .join(' ');
    case 'Literal':
      if (typeof node.value === 'string') {
        return "'" + node.value + "'";
      }
      if (typeof node.value === 'boolean') {
        return node.value.toString().toUpperCase();
      }
      return node.value.toString();
    case 'Block':
      return (
        '{' +
        node.body.map((child) => prettyText(child, level + 1)).join(';') +
        '}'
      );
    case 'Assignment':
      return `${node.name} = ${prettyText(node.value, level)}`;
    case 'Identifier':
      return node.name;
    case 'BinaryExpression':
      return `(${prettyText(node.left, level)} ${OPERATOR_VIEW[node.operator]} ${prettyText(node.right, level)})`;
    case 'MemberExpression':
      return `${prettyText(node.object, level)}.${node.property}`;
    case 'CallExpression':
      return `${prettyText(node.callee, level)}(${node.arguments.map((argument) => prettyText(argument, level)).join(',')})`;
    case 'ReplaceStatement':
      return `REPLACE ${printSelector(node.selector, level)} WITH ${prettyText(node.newValue, level)}${node.andStatement ? ' AND ' + prettyText(node.andStatement, level) : ''}${node.orStatement ? ' OR ' + prettyText(node.orStatement, level) : ''}`;
    case 'InStatement':
      return [
        `IN ${printSelector(node.selector, level)}`,
        node.alias ? `AS ${node.alias}` : null,
        prettyText(node.statement, level)
      ]
        .filter(Boolean)
        .join(' ');
    case 'SelectorPattern':
      return [
        node.nodeType,
        node.filter
          ? [
              '[',
              ...(node.filter || []).map((expression) =>
                prettyText(expression, level)
              ),
              ']'
            ]
          : null
      ]
        .flat()
        .join('');
    case 'ObjectLiteral':
      return (
        `{` +
        Object.entries(node.map).map(
          ([key, expression]) => `${key}: ${prettyText(expression, level)}`
        ) +
        `}`
      );
    case 'Breakpoint':
      return 'BREAKPOINT';
    default:
      throw new UnreachableCaseError(node);
  }
};
