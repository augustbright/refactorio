/**@type import('eslint').Rule.RuleModule */
export const requireDisclaimer = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Append a special header to the file, e.g. a license or disclaimer'
    },
    fixable: 'code',
    // accepts disclaimer content and boundary string as options
    schema: [
      {
        type: 'object',
        properties: {
          disclaimer: {
            type: 'string'
          },
          boundary: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    ]
  },
  create: function (context) {
    return {
      Program: function (node) {
        const options = context.options[0];
        const disclaimer = options.disclaimer;
        const boundary = options.boundary;
        const comments = node.comments;

        const stretchLine = (line, width) =>
          `${line}${Array(width - line.length)
            .fill(' ')
            .join('')}`;

        const formattedDisclaimer = () => {
          const lines = disclaimer.split('\n');
          const disclaimerWidth = [boundary, lines]
            .flat()
            .reduce((max, line) => (line.length > max ? line.length : max), 0);

          return {
            text: lines
              .map((line) => {
                return ` ** ${stretchLine(line, disclaimerWidth)} **`;
              })
              .join('\n'),
            width: disclaimerWidth
          };
        };
        const expectedDisclaimerComment = () => {
          const { text, width } = formattedDisclaimer();
          return [
            `/** ${stretchLine(boundary, width)} **`,
            text,
            ` ** ${stretchLine(boundary, width)} */`
          ].join('\n');
        };

        /**@type import('eslint').Rule.ReportFixer*/
        const missingCommentFixer = (fixer) => {
          const sourceCode = context.sourceCode;
          const text = sourceCode.getText(node);
          const newCode = [
            expectedDisclaimerComment(),
            text.match(/^\s*(?<code>\S.*)$/)?.groups?.code || text
          ].join('\n');
          return fixer.replaceText(node, newCode);
        };
        if (!comments) {
          context.report({
            node,
            message: 'Missing the disclaimer comment.',
            fix: missingCommentFixer
          });
          return;
        }
        const isDisclaimer = (text) => {
          const lines = text.split('\n');
          return lines[0].includes(boundary) && lines.at(-1).includes(boundary);
        };
        const disclaimerComments = comments.filter((comment) =>
          isDisclaimer(comment.value)
        );
        if (disclaimerComments.length === 0) {
          context.report({
            node,
            message: 'Missing the disclaimer comment.',
            fix: missingCommentFixer
          });
          return;
        } else if (disclaimerComments.length > 1) {
          context.report({
            node,
            message: 'Multiple disclaimer comments found.',
            fix(fixer) {
              return disclaimerComments.slice(1).map((comment) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return fixer.removeRange(comment.range);
              });
            }
          });
          return;
        }

        const disclaimerComment = disclaimerComments[0];
        const matches = (actualDisclaimer) => {
          const actualLines = actualDisclaimer.split('\n').slice(1, -1);
          const expectedLines = disclaimer.split('\n');
          return (
            actualLines.length === expectedLines.length &&
            actualLines.every(
              (line, index) =>
                line.replace(/(^ \*\* )/, '').replace(/(\s*\*\*$)/, '') ===
                expectedLines[index]
            )
          );
        };

        if (!matches(disclaimerComment.value)) {
          context.report({
            node,
            message: 'The disclaimer comment does not match the expected.',
            fix(fixer) {
              return fixer.replaceTextRange(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                disclaimerComment.range,
                expectedDisclaimerComment()
              );
            }
          });
        }

        // success: The disclaimer is found and matches the expected
      }
    };
  }
};
