export const getPopupContainer = (_e?: HTMLElement): HTMLElement => {
  const elem = document.querySelector('refly-main-app')?.shadowRoot?.querySelector('.main');

  return elem as HTMLElement;
};

export const calcPopupPosition = (
  rect: DOMRect,
  barDimesion: { barWidth: number; barHeight: number },
) => {
  const { barHeight, barWidth } = barDimesion;
  let top = 0;
  let left = 0;

  const viewportWidth = window.visualViewport?.width || 0;
  const viewportHeight = window.visualViewport?.height || 0;

  if (rect.width <= barWidth) {
    left = rect.left - (barWidth - rect.width) / 2;
  } else if (rect.width > barWidth) {
    left = rect.left + (rect.width - barWidth) / 2;
  }

  if (left < 0) left = 0;
  if (left + barWidth > viewportWidth) left = viewportHeight - barWidth;

  if (rect.bottom + barHeight > viewportHeight) {
    top = rect.top - 12;
  } else if (rect.bottom + barHeight <= viewportHeight) {
    top = rect.bottom + 12;
  }

  return { top, left };
};

export const scrollToBottom = () => {
  setTimeout(() => {
    const chatWrapperElem = document.querySelector('.ai-copilot-message-container');

    if (chatWrapperElem) {
      const { scrollHeight, clientHeight } = chatWrapperElem;
      chatWrapperElem.scroll({
        behavior: 'smooth',
        top: scrollHeight - clientHeight + 50,
      });
    }
  });
};

export function getCSSVar(varName: string) {
  return getComputedStyle(document.body).getPropertyValue(varName).trim();
}

export function isMobileScreen() {
  return window.innerWidth <= 600;
}

export const downloadPlugin = async () => {
  window.open('http://localhost:5173/');
};

export const openGetStartDocument = async () => {
  window.open('https://refly.ai/docs');
};
