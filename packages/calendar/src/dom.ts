type Child = Node | string | null | undefined | false;

/**
 * Creates an element. `on*` functions become listeners, known properties are assigned,
 * everything else becomes an attribute. `null`, `undefined` and `false` are skipped.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith("on") && typeof value === "function") element.addEventListener(key.slice(2), value as EventListener);
    else if (key !== "part" && !key.includes("-") && key in element) (element as unknown as Record<string, unknown>)[key] = value;
    else element.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of children) if (child !== null && child !== undefined && child !== false) element.append(child);
  return element;
}

/** Whether a keyboard or clipboard event comes from a place where the user types. */
export function isTyping(e: Event): boolean {
  const target = e.composedPath()[0];
  if (target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable)) return true;
  return target instanceof HTMLInputElement && !["range", "checkbox", "radio", "button", "submit"].includes(target.type);
}
