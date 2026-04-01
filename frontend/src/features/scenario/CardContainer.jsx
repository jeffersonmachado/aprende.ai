import { Card } from '../../components';

export default function CardContainer({
  children,
  className = '',
  interactive = false,
  selected = false,
  onClick,
  as = 'div'
}) {
  const Tag = as;

  return (
    <Card
      as={Tag}
      variant="elevated"
      className={`scenario-card ${interactive ? 'is-interactive' : ''} ${selected ? 'is-selected' : ''} ${className}`.trim()}
      onClick={onClick}
      type={Tag === 'button' ? 'button' : undefined}
    >
      {children}
    </Card>
  );
}
