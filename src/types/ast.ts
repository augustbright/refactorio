export type TOperator =
  | 'EQUALITY'
  | 'UNEQUALITY'
  | 'PLUS'
  | 'MINUS'
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'AND'
  | 'OR';

export interface TNode {
  type: string;
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

export interface TReplaceStatement extends TNode {
  type: 'ReplaceStatement';
  selector: TExpression;
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

export interface TBinaryExpression extends TNode {
  type: 'BinaryExpression';
  operator: TOperator;
  left: TExpression;
  right: TExpression;
}

export interface TCallExpression extends TNode {
  type: 'CallExpression';
  callee: TExpression;
  arguments: TExpression[];
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

export type TStatement =
  | TVariableDeclaration
  | TReplaceStatement
  | TIfStatement
  | TAssignment
  | TBlock
  | TExpression;

export type TExpression =
  | TIdentifier
  | TLiteral
  | TBinaryExpression
  | TMemberExpression
  | TCallExpression;

export interface TProgram extends TNode {
  type: 'Program';
  body: TStatement[];
}

export type TCommonNode = TProgram | TStatement | TExpression;
