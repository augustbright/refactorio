/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-return */
import { expectLocation } from './asyncMatchers';

import {
  TAssignment,
  TBinaryExpression,
  TBlock,
  TCallExpression,
  TCommonNode,
  TIdentifier,
  TIfStatement,
  TInStatement,
  TLiteral,
  TMemberExpression,
  TNodeWithType,
  TObjectLiteral,
  TReplaceStatement,
  TSelectorPattern,
  TVariableDeclaration
} from 'src/types';

type TNodeMatcherParameters<T extends TCommonNode['type']> = Partial<
  Omit<TNodeWithType<T>, 'type' | 'loc'>
>;

const expectNode = <T extends TCommonNode['type']>(
  type: T,
  properties: TNodeMatcherParameters<T> = {}
) =>
  expect.objectContaining({
    type,
    loc: expectLocation(),
    ...properties
  });

const nodeMatchers = {
  expectNode,
  expectProgram: (body: TNodeMatcherParameters<'Program'>['body']) =>
    expectNode('Program', { body }),
  expectVariableDeclaration: (
    name: TVariableDeclaration['name'],
    value: TVariableDeclaration['value']
  ) => expectNode('VariableDeclaration', { name, value }),
  expectAssignment: (name: TAssignment['name'], value: TAssignment['value']) =>
    expectNode('Assignment', { name, value }),
  expectBinaryExpression: (
    operator: TBinaryExpression['operator'],
    left: TBinaryExpression['left'],
    right: TBinaryExpression['right']
  ) => expectNode('BinaryExpression', { operator, left, right }),
  expectBlock: (body: TBlock['body']) => expectNode('Block', { body }),
  expectBreakpoint: () => expectNode('Breakpoint', {}),
  expectCallExpression: (
    callee: TCallExpression['callee'],
    args: TCallExpression['arguments']
  ) => expectNode('CallExpression', { callee, arguments: args }),
  expectIdentifier: (name: TIdentifier['name']) =>
    expectNode('Identifier', { name }),
  expectIfStatement: (
    condition: TIfStatement['condition'],
    statement: TIfStatement['statement'],
    elseStatement?: TIfStatement['elseStatement']
  ) => expectNode('IfStatement', { condition, statement, elseStatement }),
  expectInStatement: (
    selector: TInStatement['selector'],
    alias: TInStatement['alias'],
    statement: TInStatement['statement']
  ) => expectNode('InStatement', { selector, alias, statement }),
  expectLiteral: (value: TLiteral['value']) => expectNode('Literal', { value }),
  expectMemberExpression: (
    object: TMemberExpression['object'],
    property: TMemberExpression['property']
  ) => expectNode('MemberExpression', { object, property }),
  expectObjectLiteral: (map: TObjectLiteral['map']) =>
    expectNode('ObjectLiteral', { map }),
  expectReplaceStatement: (
    selector: TReplaceStatement['selector'],
    newValue: TReplaceStatement['newValue'],
    andStatement?: TReplaceStatement['andStatement'],
    orStatement?: TReplaceStatement['orStatement']
  ) =>
    expectNode('ReplaceStatement', {
      selector,
      newValue,
      andStatement,
      orStatement
    }),
  expectSelectorPattern: (
    nodeType: TSelectorPattern['nodeType'],
    filter?: TSelectorPattern['filter']
  ) => expectNode('SelectorPattern', { nodeType, filter })
} satisfies Record<`expect${TCommonNode['type']}` | `expectNode`, unknown>;

export = nodeMatchers;
