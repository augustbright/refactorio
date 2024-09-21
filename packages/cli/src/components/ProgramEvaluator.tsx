import {
  TCommonNode,
  TProgram,
  createDebuggingContext,
  createEvaluationContext,
  evaluateProgram,
  extractLocation,
  setDebugging
} from '@refactorio/engine';

import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';

export const ProgramEvaluator = ({
  program,
  code
}: {
  program: TProgram;
  code: string;
}) => {
  const [printItems, setPrintItems] = useState<
    {
      key: number;
      value: string;
    }[]
  >([]);
  const [done, setDone] = useState(false);
  const debuggingContext = useState(() => createDebuggingContext())[0];

  setDebugging(debuggingContext, true);
  const evaluationContext = useState(() =>
    createEvaluationContext(
      {
        print: {
          value: (value: string) => {
            setPrintItems((prev) => [
              ...prev,
              {
                key: prev.length,
                value
              }
            ]);
          }
        }
      },
      {
        parent: debuggingContext
      }
    )
  )[0];
  const evaluation = useState(() =>
    evaluateProgram(evaluationContext, program)
  )[0];
  const [node, setNode] = useState<TCommonNode | null>(null);

  useInput((input, _key) => {
    if (input === 's') {
      const { value, done } = evaluation.next('step');
      if (done) {
        setNode(null);
        setDone(true);
      } else {
        setNode(value.node as TCommonNode);
      }
    } else if (input === 'i') {
      const { value, done } = evaluation.next('step into');
      if (done) {
        setNode(null);
      } else {
        setNode(value.node as TCommonNode);
      }
    } else if (input === 'o') {
      const { value, done } = evaluation.next('step out');
      if (done) {
        setNode(null);
      } else {
        setNode(value.node as TCommonNode);
      }
    } else if (input === 'r') {
      const { value, done } = evaluation.next('run');
      if (done) {
        setNode(null);
      } else {
        setNode(value.node as TCommonNode);
      }
    }
  });

  let codeContent: React.ReactElement = <Text>{code}</Text>;
  if (node && node.loc) {
    const locationExtracted = extractLocation(code, node.loc) as [
      string,
      string,
      string
    ];
    codeContent = (
      <Text>
        <Text>{locationExtracted[0]}</Text>
        <Text backgroundColor='yellow'>{locationExtracted[1]}</Text>
        <Text>{locationExtracted[2]}</Text>
      </Text>
    );
  }

  const infoContent: React.ReactElement = (
    <>
      <Box
        borderStyle={'single'}
        borderTop={false}
        borderRight={false}
        borderLeft={false}
      >
        {!node && !done && <Text>Not started</Text>}
        {node && !done && <Text color='yellow'>{node.type}</Text>}
        {done && <Text color='green'>Done</Text>}
      </Box>

      {!done && (
        <>
          <Text color='gray'>
            <Text backgroundColor='cyan'> s </Text> - step over
          </Text>
          <Text color='gray'>
            <Text backgroundColor='cyan'> i </Text> - step into
          </Text>
          <Text color='gray'>
            <Text backgroundColor='cyan'> o </Text> - step out
          </Text>
          <Text color='gray'>
            <Text backgroundColor='cyan'> r </Text> - run
          </Text>
        </>
      )}
    </>
  );

  return (
    <Box flexDirection='row'>
      <Box flexGrow={1}>{codeContent}</Box>
      <Box
        width={40}
        flexDirection='column'
        alignItems='stretch'
      >
        <Box
          borderStyle='single'
          flexDirection='column'
          padding={1}
        >
          {infoContent}
        </Box>

        <Box
          flexDirection='column'
          padding={1}
        >
          <Box
            borderStyle={'single'}
            borderTop={false}
            borderRight={false}
            borderLeft={false}
          >
            <Text>Log</Text>
          </Box>

          {printItems.map((item) => (
            <Text key={item.key}>{item.value}</Text>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
