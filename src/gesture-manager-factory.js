/*
 * GestureManager
 *
 * Copyright (c) 2019 Kazuyoshi Tomita
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import GestureManager from './gesture-manager.js';

export default function createGestureManager(element) {
  if (typeof element == 'string') {
    element = document.querySelector(element);
  }

  return new GestureManager(element);
}
