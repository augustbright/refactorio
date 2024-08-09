import {
  expectAssignment,
  expectBinaryExpression,
  expectCallExpression,
  expectIdentifier,
  expectIfStatement,
  expectInStatement,
  expectLiteral,
  expectMemberExpression,
  expectObjectLiteral,
  expectProgram,
  expectReplaceStatement,
  expectSelectorPattern,
  expectVariableDeclaration
} from './testUtils/nodeMatchers';

import { parse } from 'src/parsing';
import { prettyText } from 'src/utils/prettyText';

describe('parser', () => {
  test('parses tokens', () => {
    expect(parse('')).toEqual(expectProgram([]));

    expect(parse('SET foo = 123')).toEqual(
      expectProgram([expectVariableDeclaration('foo', expectLiteral(123))])
    );

    expect(parse(`IF foo == 'hello' bar = TRUE`)).toEqual(
      expectProgram([
        expectIfStatement(
          expectBinaryExpression(
            'EQUALITY',
            expectIdentifier('foo'),
            expectLiteral('hello')
          ),
          expectAssignment('bar', expectLiteral(true))
        )
      ])
    );
  });

  test('parses block statements', () => {
    expect(
      prettyText(
        parse(`
IF TRUE
  foo = 1
  IF FALSE
    foo = 1
ELSE
  baz = 3
`),
        0
      )
    ).toEqual(`IF TRUE {foo = 1;IF FALSE {foo = 1}} ELSE {baz = 3}`);
  });

  test('object member expression', () => {
    expect(parse('SET foo = foo.prop1')).toEqual(
      expectProgram([
        expectVariableDeclaration(
          'foo',
          expectMemberExpression(expectIdentifier('foo'), 'prop1')
        )
      ])
    );

    expect(parse(`SET foo = ('foo' + 'bar').prop1.prop2`)).toEqual(
      expectProgram([
        expectVariableDeclaration(
          'foo',
          expectMemberExpression(
            expectMemberExpression(
              expectBinaryExpression(
                'PLUS',
                expectLiteral('foo'),
                expectLiteral('bar')
              ),
              'prop1'
            ),
            'prop2'
          )
        )
      ])
    );
  });

  test('IN statement', () => {
    expect(
      parse(`IN BlockStatement AS block print('Hello from some Block!')`)
    ).toEqual(
      expectProgram([
        expectInStatement(
          [expectSelectorPattern('BlockStatement')],
          'block',
          expectCallExpression(expectIdentifier('print'), [
            expectLiteral('Hello from some Block!')
          ])
        )
      ])
    );

    expect(
      parse(
        `IN BlockStatement Identifier[name=='foo'] AS i REPLACE WITH i.with({name: 'bar'})`
      )
    ).toEqual(
      expectProgram([
        expectInStatement(
          [
            expectSelectorPattern('BlockStatement'),
            expectSelectorPattern('Identifier', [
              expectBinaryExpression(
                'EQUALITY',
                expectIdentifier('name'),
                expectLiteral('foo')
              )
            ])
          ],
          'i',
          expectReplaceStatement(
            [],
            expectCallExpression(
              expectMemberExpression(expectIdentifier('i'), 'with'),
              [expectObjectLiteral({ name: expectLiteral('bar') })]
            )
          )
        )
      ])
    );

    expect(
      prettyText(
        parse(`
IN BlockStatement AS block
  SET replaced = 0

  IN VariableDeclaration[kind == 'const'] AS declaration
    IN VariableDeclarator Identifier AS i
      IN block Identifier[name == i.name] AS same
        IF count(same) == 2
          REPLACE same WITH declaration.init
          replaced = replaced + 1

  print('Replaced: ' + replaced + 'usages')
`),
        0
      )
    ).toBe(
      `IN BlockStatement AS block {SET replaced = 0;IN VariableDeclaration[(kind == 'const')] AS declaration {IN VariableDeclarator Identifier AS i {IN block Identifier[(name == i.name)] AS same {IF (count(same) == 2) {REPLACE same WITH declaration.init;replaced = (replaced + 1)}}}};print((('Replaced: ' + replaced) + 'usages'))}`
    );
  });

  test('call expressions', () => {
    expect(parse(`foo()`)).toEqual(
      expectProgram([expectCallExpression(expectIdentifier('foo'), [])])
    );

    expect(parse(`foo(a, b, c)`)).toEqual(
      expectProgram([
        expectCallExpression(expectIdentifier('foo'), [
          expectIdentifier('a'),
          expectIdentifier('b'),
          expectIdentifier('c')
        ])
      ])
    );
  });

  test('complex expressions', () => {
    expect(prettyText(parse('SET foo = foo.prop1 + foo.prop2'), 0)).toBe(
      'SET foo = (foo.prop1 + foo.prop2)'
    );

    expect(prettyText(parse('SET foo = 2 + 2 * 2'), 0)).toBe(
      'SET foo = (2 + (2 * 2))'
    );
    expect(prettyText(parse('SET foo = (2 + 2) * 2'), 0)).toBe(
      'SET foo = ((2 + 2) * 2)'
    );
    expect(prettyText(parse(`IF (2 + 2) * 2 == 8 foo = 'hello'`), 0)).toBe(
      `IF (((2 + 2) * 2) == 8) foo = 'hello'`
    );
    expect(prettyText(parse(`IF test one() ELSE two()`), 0)).toBe(
      `IF test one() ELSE two()`
    );
    expect(
      prettyText(
        parse(
          `IF (2 + 2) * 2 == 8 AND foo != 'hello' foo = 'hello' + 'there' + '!' ELSE foo = 'bye'`
        ),
        0
      )
    ).toBe(
      `IF ((((2 + 2) * 2) == 8) AND (foo != 'hello')) foo = (('hello' + 'there') + '!') ELSE foo = 'bye'`
    );

    expect(
      prettyText(parse(`obj.func1(some.func2() + other.func3()().result())`), 0)
    ).toBe(`obj.func1((some.func2() + other.func3()().result()))`);
  });

  test('code parsing', () => {
    expect(
      prettyText(
        parse(`
// define a variable
SET hit = false
SET foo = 'one' + 'two'

REPLACE ImportDefaultSpecifier[local.name == 'css']
WITH ImportDefaultSpecifier(Identifier('styles'))
AND hit = TRUE
OR hit = TRUE

IF hit == TRUE
	REPLACE Identifier[name == 'css']
    WITH Identifier('styles')
    AND hit = FALSE
`),
        0
      )
    ).toBe(
      `SET hit = false;SET foo = ('one' + 'two');REPLACE ImportDefaultSpecifier[(local.name == 'css')] WITH ImportDefaultSpecifier(Identifier('styles')) AND hit = TRUE OR hit = TRUE;IF (hit == TRUE) {REPLACE Identifier[(name == 'css')] WITH Identifier('styles') AND hit = FALSE}`
    );

    expect(
      prettyText(
        parse(`
REPLACE ImportDefaultSpecifier[local.name == 'css']
WITH ImportDefaultSpecifier(Identifier('styles'))
AND
	REPLACE Identifier[name == 'css']
    WITH Identifier('styles')
    AND hit = TRUE

IF hit == TRUE
    print('success!')
`),
        0
      )
    ).toBe(
      `REPLACE ImportDefaultSpecifier[(local.name == 'css')] WITH ImportDefaultSpecifier(Identifier('styles')) AND {REPLACE Identifier[(name == 'css')] WITH Identifier('styles') AND hit = TRUE};IF (hit == TRUE) {print('success!')}`
    );
  });
  test('test', () => {
    expect(() =>
      parse(`
print('Hello world!')
print('How are you?')
`)
    ).not.toThrow();
  });
});
