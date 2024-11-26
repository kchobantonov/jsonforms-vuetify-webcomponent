import type { ExampleDescription } from '@/core/types';

const knownExamples: { [key: string]: ExampleDescription } = {};

export const registerExamples = (examples: ExampleDescription[]): void => {
  examples.forEach((example) => (knownExamples[example.name] = example));
};

export const getExamples: () => ExampleDescription[] = () => {
  const examples = Object.keys(knownExamples).map((key) => knownExamples[key]);
  examples.sort((a, b) => a.label.localeCompare(b.label));
  return examples;
};
