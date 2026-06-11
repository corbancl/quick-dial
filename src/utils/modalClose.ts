/**
 * Svelte action: use:modalClose={onclose}
 * 
 * Closes the modal on:
 * 1. Click on the overlay background (outside modal content)
 * 2. Pressing the Escape key
 * 
 * Usage: <div class="modal-overlay" use:modalClose={onclose}>...</div>
 */
export function modalClose(node: HTMLElement, onclose: () => void) {
  function handleClick(e: MouseEvent) {
    if (e.target === node) onclose();
  }
  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }

  node.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKey);

  return {
    destroy() {
      node.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    },
  };
}
