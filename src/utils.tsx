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

export function extractHashtags(text: string): string[] {
  const hashtagPattern = /#[\w가-힣]+/g;
  const matches = text.match(hashtagPattern);
  return matches || [];
}

export function generateKeywords(text: string) {
  return (
    text
      .split(/\s+|#|_/g)
      .flatMap((word) => word.match(/[\w가-힣]+/g) ?? [])
      .filter((word) => word?.length > 0)
      .map((word) => word?.toLowerCase()) || []
  );
}
