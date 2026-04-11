import { createTheme, type MantineColorsTuple } from '@mantine/core';

const parfumGreen: MantineColorsTuple = [
  '#e8f0ec',
  '#d0e3d8',
  '#a8cdb8',
  '#7fb396',
  '#569a75',
  '#3d7f5d',
  '#2d6649',
  '#234d3b',
  '#1a3d2e',
  '#0f2419',
];

export const adminTheme = createTheme({
  primaryColor: 'parfum',
  colors: {
    parfum: parfumGreen,
  },
  defaultRadius: 'md',
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: { fontWeight: '600' },
});
