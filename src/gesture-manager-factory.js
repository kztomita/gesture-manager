import GestureManager from './gesture-manager.js';

export default function createGestureManager(element) {
  if (typeof element == 'string') {
    element = document.querySelector(element);
  }

  return new GestureManager(element);
}
