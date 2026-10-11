/** Validate known select values while allowing optional fields to be omitted. */
export function isLeadOption(
  options: readonly { id: string }[],
  value: string | undefined,
  optional = false,
): boolean {
  if (optional && (value === undefined || value === "")) return true;
  return options.some((option) => option.id === value);
}
