import { TLocation } from './location';

import { TBinaryExpressionOperatorTokenType } from 'src/tokens/types';

export type TNode = {
  type: string;
  loc: TLocation;
};

export type TVariableDeclaration = {
  type: 'VariableDeclaration';
  name: string;
  value: TExpression;
} & TNode;

export type TAssignment = {
  type: 'Assignment';
  name: string;
  value: TExpression;
} & TNode;

export type TInStatement = {
  type: 'InStatement';
  selector: TSelectorPattern[];
  alias: string;
  statement: TStatement;
} & TNode;

export type TReplaceStatement = {
  type: 'ReplaceStatement';
  selector: TSelectorPattern[];
  newValue: TExpression;
  andStatement?: TStatement;
  orStatement?: TStatement;
} & TNode;

export type TIfStatement = {
  type: 'IfStatement';
  condition: TExpression;
  statement: TStatement;
  elseStatement?: TStatement;
} & TNode;

export type TIdentifier = {
  type: 'Identifier';
  name: string;
} & TNode;

export type TLiteral = {
  type: 'Literal';
  value: string | number | boolean;
} & TNode;

export type TObjectLiteral = {
  type: 'ObjectLiteral';
  map: Record<string, TExpression>;
} & TNode;

export type TBinaryExpression = {
  type: 'BinaryExpression';
  operator: TBinaryExpressionOperatorTokenType;
  left: TExpression;
  right: TExpression;
} & TNode;

export type TCallExpression = {
  type: 'CallExpression';
  callee: TExpression;
  arguments: TExpression[];
} & TNode;

export type TSelectorPattern = {
  type: 'SelectorPattern';
  nodeType: string;
  filter?: TExpression[];
} & TNode;

export type TMemberExpression = {
  type: 'MemberExpression';
  object: TExpression;
  property: string;
} & TNode;

export type TBlock = {
  type: 'Block';
  body: TStatement[];
} & TNode;

export type TBreakpoint = {
  type: 'Breakpoint';
} & TNode;

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

export type TProgram = {
  type: 'Program';
  body: TStatement[];
} & TNode;

export type TCommonNode =
  | TProgram
  | TStatement
  | TExpression
  | TSelectorPattern;

export type TNodeWithType<T extends TCommonNode['type']> = Extract<
  TCommonNode,
  { type: T }
>;
