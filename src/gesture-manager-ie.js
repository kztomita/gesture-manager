/*
 * GestureManager
 *
 * Copyright (c) 2019 Kazuyoshi Tomita
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import Vector from './vector.js';
import Event from './event.js';
import mixinListener from './listener.js';

export default class GestureManagerIE {
  constructor(nd) {
    this.node = nd;
    this.tapWork = {touchX: null,
                    touchY: null,
                    touchTime: null,
                   };
    this.gestureWork = {startPinchDistance: null, // gesture開始時の指の距離
                        startAngle: 0,            // gesture開始時の角度(度)
                        startCenter: null,        // gesture開始時の中心座標
                        pointers: {}};
    this.emulateGestureEvent = false;

    this.eventHandlers = {MSPointerDown:   (event) => {this.pointerDown(event)},
                          MSPointerMove:   (event) => {this.pointerMove(event)},
                          MSPointerUp:     (event) => {this.pointerUp(event)},
                          MSPointerCancel: (event) => {this.pointerUp(event)}};
    for (var evname in this.eventHandlers) {
      nd.addEventListener(evname, this.eventHandlers[evname], false);
    }
  }

  unbindEvent() {
    for (var evname in this.eventHandlers) {
      this.node.removeEventListener(evname, this.eventHandlers[evname], false);
    }
  }

  pointerCount() {
    var touchCnt = 0;
    for (var k in this.gestureWork.pointers)
      touchCnt++;
    return touchCnt;
  }

  gestureStart(event) {
    var e = new Event('gesturestart');
    this.dispatchEvent(e);
  }

  gestureChange(event) {
    var e = new Event('gesturechange');
    e.scale = event._scale;
    e.rotation = event._rotation;
    e.center = this.gestureWork.startCenter;
    this.dispatchEvent(e);

    event.preventDefault();
  }

  gestureEnd(event) {
    var e = new Event('gestureend');
    this.dispatchEvent(e);
  }


  pointerDown(event) {
    event.preventDefault();

    this.gestureWork.pointers[event.pointerId] = {clientX: event.clientX,
					          clientY: event.clientY};

    var pointerCnt = this.pointerCount();

    var now = new Date;
    if (pointerCnt == 1) {
      this.tapWork.touchX = event.clientX;
      this.tapWork.touchY = event.clientY;
      this.tapWork.touchTime = now.getTime();
    } else {
      // ジェスチャーが入ったらtapはキャンセル      
      this.tapWork.touchTime = null;
    }

    // 2本指になったらジェスチャ開始
    if (pointerCnt == 2) {
      var pointers = [];
      for (var pid in this.gestureWork.pointers) {
        pointers.push(this.gestureWork.pointers[pid]);
      }
      var vec = new Vector(pointers[1].clientX - pointers[0].clientX,
                           pointers[1].clientY - pointers[0].clientY);
      this.gestureWork.startPinchDistance = vec.size;
      this.gestureWork.startAngle = vec.angle() * 180.0 / Math.PI;
      this.gestureWork.startCenter = new Vector((pointers[1].clientX + pointers[0].clientX) / 2,
                                                (pointers[1].clientY + pointers[0].clientY) / 2);
      this.gestureStart(event);
    }

    event.preventDefault();
  }

  pointerMove(event) {
    var pointer = this.gestureWork.pointers[event.pointerId];
    if (!pointer)
      return;

    // 移動があったらtapはキャンセル(わずかな移動は許容)
    if (this.tapWork.touchTime &&
        (Math.abs(event.clientX - this.tapWork.touchX) > 10 ||
         Math.abs(event.clientY - this.tapWork.touchY) > 10)) {
      this.tapWork.touchTime = null;
    }

    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;

    var pointerCnt = this.pointerCount();

    if (pointerCnt >= 2) {
      var pointers = [];
      for (var pid in this.gestureWork.pointers) {
        pointers.push(this.gestureWork.pointers[pid]);
      }

      var vec = new Vector(pointers[1].clientX - pointers[0].clientX,
                           pointers[1].clientY - pointers[0].clientY);

      var currentPinchDistance = vec.size;
      var currentAngle = vec.angle() * 180.0 / Math.PI;
      event._scale = currentPinchDistance / this.gestureWork.startPinchDistance;
      event._rotation = currentAngle - this.gestureWork.startAngle;
      this.gestureChange(event);
    }

    event.preventDefault();
  }

  pointerUp(event) {
    delete this.gestureWork.pointers[event.pointerId];

    var pointerCnt = this.pointerCount();

    if (pointerCnt == 0 && this.tapWork.touchTime !== null) {
      var now = new Date;
      if (now.getTime() - this.tapWork.touchTime < 500) {
        var e = new Event('tap');
        e.clientX = this.tapWork.touchX;
        e.clientY = this.tapWork.touchY;
        this.dispatchEvent(e);

        var doubleTapped = false;
        if (this.lastTap) {
          if (now.getTime() - this.lastTap.time < 500) {
            // XXX lastTapとの座標のずれもチェックした方がいいか？
            var e = new Event('doubletap');
            e.clientX = this.tapWork.touchX;
            e.clientY = this.tapWork.touchY;
            this.dispatchEvent(e);
	    event.preventDefault();
            doubleTapped = true;
          }
        }

        if (!doubleTapped) {
          this.lastTap = {x: this.tapWork.touchX,
                          y: this.tapWork.touchY,
                          time: now.getTime()};
        } else {
          // 再タップでdouble_tapが再度発生しないように、タップ情報はクリア
          this.lastTap = null;
        }
      }
    }

    // 1本指になったらジェスチャ停止
    if (pointerCnt == 1) {
      this.gestureEnd(event);
    }
  }
}

mixinListener(GestureManagerIE.prototype, 'listeners');
