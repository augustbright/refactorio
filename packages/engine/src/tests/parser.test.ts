import { parse } from 'src/parser';
import { prettyText } from 'src/utils/prettyText';

describe('parser', () => {
  test('parses tokens', () => {
    expect(parse('')).toEqual({
      type: 'Program',
      body: []
    });

    expect(parse('SET foo = 123')).toEqual({
      type: 'Program',
      body: [
        {
          type: 'VariableDeclaration',
          name: 'foo',
          value: {
            type: 'Literal',
            value: 123
          }
        }
      ]
    });

    expect(parse(`IF foo == 'hello' bar = TRUE`)).toEqual({
      type: 'Program',
      body: [
        {
          type: 'IfStatement',
          condition: {
            type: 'BinaryExpression',
            operator: 'EQUALITY',
            left: {
              type: 'Identifier',
              name: 'foo'
            },
            right: {
              type: 'Literal',
              value: 'hello'
            }
          },
          statement: {
            type: 'Assignment',
            name: 'bar',
            value: {
              type: 'Literal',
              value: true
            }
          }
        }
      ]
    });
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
    expect(parse('SET foo = foo.prop1')).toEqual({
      type: 'Program',
      body: [
        {
          type: 'VariableDeclaration',
          name: 'foo',
          value: {
            type: 'MemberExpression',
            property: 'prop1',
            object: { name: 'foo', type: 'Identifier' }
          }
        }
      ]
    });

    expect(parse(`SET foo = ('foo' + 'bar').prop1.prop2`)).toEqual({
      type: 'Program',
      body: [
        {
          type: 'VariableDeclaration',
          name: 'foo',
          value: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: {
                type: 'BinaryExpression',
                operator: 'PLUS',
                left: {
                  type: 'Literal',
                  value: 'foo'
                },
                right: {
                  type: 'Literal',
                  value: 'bar'
                }
              },
              property: 'prop1'
            },
            property: 'prop2'
          }
        }
      ]
    });
  });

  test('IN statement', () => {
    expect(
      parse(`IN BlockStatement AS block print('Hello from some Block!')`)
    ).toEqual({
      type: 'Program',
      body: [
        {
          type: 'InStatement',
          alias: 'block',
          selector: [{ type: 'TSelectorPattern', nodeType: 'BlockStatement' }],
          statement: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'print' },
            arguments: [{ type: 'Literal', value: 'Hello from some Block!' }]
          }
        }
      ]
    });

    expect(
      parse(
        `IN BlockStatement Identifier[name=='foo'] AS i REPLACE WITH i.with({name: 'bar'})`
      )
    ).toEqual({
      type: 'Program',
      body: [
        {
          type: 'InStatement',
          alias: 'i',
          selector: [
            { type: 'TSelectorPattern', nodeType: 'BlockStatement' },
            {
              type: 'TSelectorPattern',
              nodeType: 'Identifier',
              filter: [
                {
                  type: 'BinaryExpression',
                  operator: 'EQUALITY',
                  left: { type: 'Identifier', name: 'name' },
                  right: { type: 'Literal', value: 'foo' }
                }
              ]
            }
          ],
          statement: {
            type: 'ReplaceStatement',
            selector: [],
            newValue: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'i' },
                property: 'with'
              },
              arguments: [
                {
                  type: 'ObjectLiteral',
                  map: { name: { type: 'Literal', value: 'bar' } }
                }
              ]
            }
          }
        }
      ]
    });

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
    expect(parse(`foo()`)).toEqual({
      type: 'Program',
      body: [
        {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'foo'
          },
          arguments: []
        }
      ]
    });
    expect(parse(`foo(a, b, c)`)).toEqual({
      type: 'Program',
      body: [
        {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'foo'
          },
          arguments: [
            {
              type: 'Identifier',
              name: 'a'
            },
            {
              type: 'Identifier',
              name: 'b'
            },
            {
              type: 'Identifier',
              name: 'c'
            }
          ]
        }
      ]
    });
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
