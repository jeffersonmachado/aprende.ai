import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import StatusPill from './StatusPill.jsx';

describe('StatusPill', () => {
  test('renderiza valor normalizado como classe', () => {
    render(<StatusPill value="Success" />);

    const element = screen.getByText('Success');
    expect(element.className).toContain('success');
  });

  test('usa unknown quando valor não existe', () => {
    render(<StatusPill />);

    const element = screen.getByText('unknown');
    expect(element.className).toContain('unknown');
  });
});
