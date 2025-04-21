export function placeCursorToEnd(element: HTMLElement) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
  element.focus();
}

export function highlightHashtags(text: string) {
  return text.replace(/(#[\w가-힣]+)/g, `<span class="hashtag">$1</span>`);
}
