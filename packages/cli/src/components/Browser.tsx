import fs from 'fs/promises';
import { Box, Text, useInput } from 'ink';
import path from 'path';
import React from 'react';
import { useQuery } from 'react-query';

export const Browser = ({
  initialDir,
  onSelect,
  enabled
}: {
  initialDir: string;
  onSelect: (file: string) => void;
  enabled: boolean;
}) => {
  const [dir, setDir] = React.useState(initialDir);
  const parentDir = path.resolve(dir, '..');
  const [selected, setSelected] = React.useState<string | null>(null);

  useInput((_input, key) => {
    if (!enabled) return;
    if (key.upArrow) {
      if (!data) return;
      if (!data.length) return;
      if (!selected) setSelected(data.at(-1)!.name);

      const index = data.findIndex((file) => file.name === selected);
      if (index !== undefined && index > 0) {
        setSelected(data[index - 1].name);
      } else {
        setSelected(data.at(-1)!.name);
      }
    } else if (key.downArrow) {
      if (!data) return;
      if (!data.length) return;
      if (!selected) setSelected(data.at(0)!.name);

      const index = data.findIndex((file) => file.name === selected);
      if (index !== undefined && index < data.length - 1) {
        setSelected(data[index + 1].name);
      } else {
        setSelected(data.at(0)!.name);
      }
    } else if (key.return) {
      if (!data) return;
      if (!data.length) return;
      const selectedFile = data.find((file) => file.name === selected);
      if (selectedFile) {
        if (selectedFile.type === 'directory') {
          setDir(selectedFile.fullPath);
        } else {
          onSelect(selectedFile.fullPath);
        }
      }
    }
  });

  const { data, error, isLoading } = useQuery(['dir', dir], async () => {
    const files = await fs.readdir(dir);

    return [
      {
        name: '..',
        type: 'directory',
        fullPath: parentDir
      },
      ...(await Promise.all(
        files.map(async (file) => {
          const fullPath = `${dir}/${file}`;
          const stats = await fs.stat(fullPath);
          if (stats.isDirectory()) {
            return {
              name: file,
              type: 'directory',
              fullPath
            } as const;
          } else {
            return {
              name: file,
              type: 'file',
              fullPath
            } as const;
          }
        })
      ))
    ];
  });

  if (isLoading) {
    return (
      <Box>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection='column'>
      <Text>Choose a file:</Text>
      <Text color='gray'>{dir}</Text>
      <Box flexDirection='column'>
        {data?.map((file) => (
          <Box
            key={file.fullPath}
            gap={1}
          >
            <Text>{file.type === 'directory' ? '📁' : '📝'}</Text>
            <Text
              backgroundColor={selected === file.name ? 'yellow' : undefined}
            >
              {file.name}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
