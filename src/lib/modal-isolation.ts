export interface ZdpModalIsolationBranch<Element, Parent> {
  readonly parent: Parent;
  readonly activeBranch: Element;
  readonly siblings: readonly Element[];
}

/** Pure plan over a tree snapshot; caller collections and nodes are never changed. */
export function resolveZdpModalIsolation<Element, Parent>(
  branches: readonly ZdpModalIsolationBranch<Element, Parent>[],
  body: Parent,
  { hasTopLayer, reachedBody }: Readonly<{ hasTopLayer: boolean; reachedBody: boolean }>
) {
  const observedParents = new Set<Parent>();
  const inertElements = new Set<Element>();
  if (hasTopLayer) observedParents.add(body);
  for (const branch of branches) observedParents.add(branch.parent);
  // Detached layers still need observation so reinsertion can restore isolation.
  if (!reachedBody) return { observedParents, inertElements };
  for (const { activeBranch, siblings } of branches) {
    for (const sibling of siblings) {
      if (sibling === activeBranch) continue;
      inertElements.add(sibling);
    }
  }
  return { observedParents, inertElements };
}
