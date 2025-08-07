export function runAnimation(element, animationClass) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }
    element.classList.add(animationClass);
    function handleEnd() {
      element.classList.remove(animationClass);
      element.removeEventListener('animationend', handleEnd);
      resolve();
    }
    element.addEventListener('animationend', handleEnd, { once: true });
  });
}
