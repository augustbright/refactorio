import { parse } from 'src/parser';
import { tokenize } from 'src/tokenizer';
import { prettyText } from 'src/utils/prettyText';

describe('parser', () => {
  test('parses tokens', () => {
    expect(parse([])).toEqual({
      type: 'Program',
      body: []
    });

    expect(
      parse([
        { type: 'SET', value: 'SET' },
        { type: 'IDENTIFIER', value: 'foo' },
        { type: 'ASSIGN', value: '=' },
        { type: 'NUMBER', value: '123' }
      ])
    ).toEqual({
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

    expect(
      parse([
        { type: 'IF', value: 'IF' },
        { type: 'IDENTIFIER', value: 'foo' },
        { type: 'EQUALITY', value: '==' },
        { type: 'STRING', value: `'hello'` },
        { type: 'IDENTIFIER', value: 'bar' },
        { type: 'ASSIGN', value: '=' },
        { type: 'BOOLEAN', value: 'TRUE' }
      ])
    ).toEqual({
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
        parse([
          { type: 'IF', value: 'IF' },
          { type: 'BOOLEAN', value: 'TRUE' },

          { type: 'NEWLINE', value: '' },
          { type: 'INDENTATION', value: '  ' },

          { type: 'IDENTIFIER', value: 'foo' },
          { type: 'ASSIGN', value: '=' },
          { type: 'NUMBER', value: '1' },

          { type: 'NEWLINE', value: '' },
          { type: 'INDENTATION', value: '  ' },

          { type: 'IF', value: 'IF' },
          { type: 'BOOLEAN', value: 'FALSE' },
          { type: 'NEWLINE', value: '' },
          { type: 'INDENTATION', value: '    ' },
          { type: 'IDENTIFIER', value: 'foo' },
          { type: 'ASSIGN', value: '=' },
          { type: 'NUMBER', value: '1' },

          { type: 'NEWLINE', value: '' },
          { type: 'ELSE', value: 'ELSE' },

          { type: 'NEWLINE', value: '' },
          { type: 'INDENTATION', value: '  ' },

          { type: 'IDENTIFIER', value: 'baz' },
          { type: 'ASSIGN', value: '=' },
          { type: 'NUMBER', value: '3' }
        ]),
        0
      )
    ).toEqual(`IF TRUE {foo = 1;IF FALSE {foo = 1}} ELSE {baz = 3}`);
  });

  test('object member expression', () => {
    expect(parse(tokenize('SET foo = foo.prop1'))).toEqual({
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

    expect(parse(tokenize(`SET foo = ('foo' + 'bar').prop1.prop2`))).toEqual({
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

  test('call expressions', () => {
    expect(parse(tokenize(`foo()`))).toEqual({
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
    expect(parse(tokenize(`foo(a, b, c)`))).toEqual({
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
    expect(
      prettyText(parse(tokenize('SET foo = foo.prop1 + foo.prop2')), 0)
    ).toBe('SET foo = (foo.prop1 + foo.prop2)');

    expect(prettyText(parse(tokenize('SET foo = 2 + 2 * 2')), 0)).toBe(
      'SET foo = (2 + (2 * 2))'
    );
    expect(prettyText(parse(tokenize('SET foo = (2 + 2) * 2')), 0)).toBe(
      'SET foo = ((2 + 2) * 2)'
    );
    expect(
      prettyText(parse(tokenize(`IF (2 + 2) * 2 == 8 foo = 'hello'`)), 0)
    ).toBe(`IF (((2 + 2) * 2) == 8) foo = 'hello'`);
    expect(
      prettyText(
        parse(
          tokenize(
            `IF (2 + 2) * 2 == 8 AND foo != 'hello' foo = 'hello' + 'there' + '!' ELSE foo = 'bye'`
          )
        ),
        0
      )
    ).toBe(
      `IF ((((2 + 2) * 2) == 8) AND (foo != 'hello')) foo = (('hello' + 'there') + '!') ELSE foo = 'bye'`
    );

    expect(
      prettyText(
        parse(tokenize(`obj.func1(some.func2() + other.func3()().result())`)),
        0
      )
    ).toBe(`obj.func1((some.func2() + other.func3()().result()))`);
  });

  test('code parsing', () => {
    expect(
      prettyText(
        parse(
          tokenize(`
// define a variable
SET hit = false
SET foo = 'one' + 'two'

REPLACE ImportDefaultSpecifier.local.name == 'css'
WITH ImportDefaultSpecifier(Identifier('styles'))
AND hit = TRUE
OR hit = TRUE

IF hit == TRUE
	REPLACE Identifier.name == 'css'
    WITH Identifier('styles')
    AND hit = FALSE
`)
        ),
        0
      )
    ).toBe(
      `SET hit = false;SET foo = ('one' + 'two');REPLACE (ImportDefaultSpecifier.local.name == 'css') WITH ImportDefaultSpecifier(Identifier('styles')) AND hit = TRUE OR hit = TRUE;IF (hit == TRUE) {REPLACE (Identifier.name == 'css') WITH Identifier('styles') AND hit = FALSE}`
    );

    expect(
      prettyText(
        parse(
          tokenize(`
REPLACE ImportDefaultSpecifier.local.name == 'css'
WITH ImportDefaultSpecifier(Identifier('styles'))
AND
	REPLACE Identifier.name == 'css'
    WITH Identifier('styles')
    AND hit = TRUE

IF hit == TRUE
    print('success!')
`)
        ),
        0
      )
    ).toBe(
      `REPLACE (ImportDefaultSpecifier.local.name == 'css') WITH ImportDefaultSpecifier(Identifier('styles')) AND {REPLACE (Identifier.name == 'css') WITH Identifier('styles') AND hit = TRUE};IF (hit == TRUE) {print('success!')}`
    );
  });
});
