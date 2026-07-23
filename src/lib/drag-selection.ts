interface ZdpDragSelectionState {
  count: number;
  classWasPresent: boolean;
}

const dragSelectionStates = new WeakMap<Document, ZdpDragSelectionState>();

export function beginZdpDragSelection(document: Document): () => void {
  const root = document.documentElement;
  const existingState = dragSelectionStates.get(document);
  const state = existingState ?? {
    count: 0,
    classWasPresent: root.classList.contains('zdp-user-select-dragging')
  };
  state.count += 1;
  dragSelectionStates.set(document, state);
  root.classList.add('zdp-user-select-dragging');

  let active = true;

  return (): void => {
    if (!active) {
      return;
    }

    active = false;
    const currentState = dragSelectionStates.get(document);

    if (!currentState) {
      return;
    }

    currentState.count -= 1;

    if (currentState.count > 0) {
      return;
    }

    dragSelectionStates.delete(document);

    if (!currentState.classWasPresent) {
      root.classList.remove('zdp-user-select-dragging');
    }
  };
}
