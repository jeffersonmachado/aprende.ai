/**
 * Utilidade para mesclar classes Tailwind de forma segura
 * Resolve conflitos de classes e remove duplicatas
 */
export function cn(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}
