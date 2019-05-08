/*
 * GestureManager
 *
 * Copyright (c) 2019 Kazuyoshi Tomita
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import GestureManager from './gesture-manager.js';
import GestureManagerIE from './gesture-manager-ie.js';

export default function createGestureManager(element) {
  if (typeof element == 'string') {
    element = document.querySelector(element);
  }

  var ua = navigator.userAgent.toLowerCase();
  if (window.navigator.msPointerEnabled) {
    return new GestureManagerIE(element);
  } else {
    return new GestureManager(element);
  }
}
