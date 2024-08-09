import { TLocation } from './location';

import { TBinaryExpressionOperatorTokenType } from 'src/tokens/types';

export interface TNode {
  type: string;
  loc: TLocation;
}

export interface TVariableDeclaration extends TNode {
  type: 'VariableDeclaration';
  name: string;
  value: TExpression;
}

export interface TAssignment extends TNode {
  type: 'Assignment';
  name: string;
  value: TExpression;
}

export interface TInStatement extends TNode {
  type: 'InStatement';
  selector: TSelectorPattern[];
  alias: string;
  statement: TStatement;
}
export interface TReplaceStatement extends TNode {
  type: 'ReplaceStatement';
  selector: TSelectorPattern[];
  newValue: TExpression;
  andStatement?: TStatement;
  orStatement?: TStatement;
}

export interface TIfStatement extends TNode {
  type: 'IfStatement';
  condition: TExpression;
  statement: TStatement;
  elseStatement?: TStatement;
}

export interface TIdentifier extends TNode {
  type: 'Identifier';
  name: string;
}

export interface TLiteral extends TNode {
  type: 'Literal';
  value: string | number | boolean;
}

export interface TObjectLiteral extends TNode {
  type: 'ObjectLiteral';
  map: Record<string, TExpression>;
}

export interface TBinaryExpression extends TNode {
  type: 'BinaryExpression';
  operator: TBinaryExpressionOperatorTokenType;
  left: TExpression;
  right: TExpression;
}

export interface TCallExpression extends TNode {
  type: 'CallExpression';
  callee: TExpression;
  arguments: TExpression[];
}

export interface TSelectorPattern extends TNode {
  type: 'SelectorPattern';
  nodeType: string;
  filter?: TExpression[];
}

export interface TMemberExpression extends TNode {
  type: 'MemberExpression';
  object: TExpression;
  property: string;
}

export interface TBlock extends TNode {
  type: 'Block';
  body: TStatement[];
}

export interface TBreakpoint extends TNode {
  type: 'Breakpoint';
}

export type TStatement =
  | TVariableDeclaration
  | TReplaceStatement
  | TIfStatement
  | TAssignment
  | TBlock
  | TExpression
  | TInStatement
  | TBreakpoint;

export type TExpression =
  | TIdentifier
  | TLiteral
  | TObjectLiteral
  | TBinaryExpression
  | TMemberExpression
  | TCallExpression;

export interface TProgram extends TNode {
  type: 'Program';
  body: TStatement[];
}

export type TCommonNode =
  | TProgram
  | TStatement
  | TExpression
  | TSelectorPattern;

export type TNodeWithType<T extends TCommonNode['type']> = Extract<
  TCommonNode,
  { type: T }
>;
