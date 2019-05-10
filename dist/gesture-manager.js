/*!
 * GestureManager
 *
 * Copyright (c) 2019 Kazuyoshi Tomita
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Version: 1.0.1
 * Build: Fri May 10 2019 14:25:13 GMT+0900 (Japan Standard Time)
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.GestureManager = {}));
}(this, function (exports) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /*
   * GestureManager
   *
   * Copyright (c) 2019 Kazuyoshi Tomita
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */
  var Vector =
  /*#__PURE__*/
  function () {
    function Vector(x, y) {
      _classCallCheck(this, Vector);

      if (typeof x == "undefined") {
        x = 0;
      }

      if (typeof y == "undefined") {
        y = 0;
      }

      this.x = x;
      this.y = y;
    }

    _createClass(Vector, [{
      key: "clone",
      value: function clone() {
        return new Vector(this.x, this.y);
      }
    }, {
      key: "plus",
      value: function plus(vec) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
      }
    }, {
      key: "minus",
      value: function minus(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
      }
    }, {
      key: "scale",
      value: function scale(val) {
        this.x *= val;
        this.y *= val;
        return this;
      }
    }, {
      key: "dot",
      value: function dot(vec) {
        return this.x * vec.x + this.y * vec.y;
      }
    }, {
      key: "normalize",
      value: function normalize() {
        var size = this.size;
        this.x /= size; // sizeのnot zero保証は呼出側で。

        this.y /= size;
        return this;
      } // ベクトルのx軸に対する角度(0-2*PI)を返す。
      // 時計回りを正方向とする。

    }, {
      key: "angle",
      value: function angle() {
        var vsize = this.size;
        if (vsize < 1) return 0;
        var cosTh = this.x / vsize;
        var rad = Math.acos(cosTh); // PI - 2*PI

        if (this.y < 0) rad = Math.PI + Math.PI - rad;
        return rad;
      } // radだけ回転させたベクトルを求める。
      // rPoint(Vector)を指定すると、その点を中心とした回転となる。

    }, {
      key: "rotate",
      value: function rotate(rad, rPoint) {
        if (typeof rPoint == "undefined") rPoint = new Vector(0, 0);
        var cosTh = Math.cos(rad);
        var sinTh = Math.sin(rad);
        var x = this.x - rPoint.x;
        var y = this.y - rPoint.y;
        this.x = cosTh * x - sinTh * y + rPoint.x;
        this.y = sinTh * x + cosTh * y + rPoint.y;
        return this;
      }
    }, {
      key: "size",
      get: function get() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      }
    }]);

    return Vector;
  }();

  /*
   * GestureManager
   *
   * Copyright (c) 2019 Kazuyoshi Tomita
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */
  var Event = function Event(name) {
    _classCallCheck(this, Event);

    this.name = name;
  };

  /*
   * GestureManager
   *
   * Copyright (c) 2019 Kazuyoshi Tomita
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */
  function mixinListener(object, prop) {
    object[prop] = {}; // メソッドを登録

    object.addEventListener = function (name, func) {
      if (!object[prop][name]) {
        object[prop][name] = new ListenerList();
      }

      object[prop][name].addListener(func);
    };

    object.removeEventListener = function (name, func) {
      if (!object[prop][name]) return;
      object[prop][name].removeListener(func);
    };

    object.dispatchEvent = function (event) {
      if (!object[prop][event.name]) return;
      object[prop][event.name].fire(event);
    };
  }

  var ListenerList =
  /*#__PURE__*/
  function () {
    function ListenerList() {
      _classCallCheck(this, ListenerList);

      this.list = [];
    }

    _createClass(ListenerList, [{
      key: "addListener",
      value: function addListener(func) {
        this.list.push(func);
      }
    }, {
      key: "removeListener",
      value: function removeListener(func) {
        for (var i = 0; i < this.list.length; i++) {
          if (this.list[i] == func) {
            this.list.splice(i, 1);
            return;
          }
        }
      }
    }, {
      key: "fire",
      value: function fire() {
        for (var i = 0; i < this.list.length; i++) {
          this.list[i].apply(this, arguments);
        }
      }
    }]);

    return ListenerList;
  }();

  /* Memo:
   * [タップ判定の条件]
   * 以下の条件を全て満す時にタップイベントを発生させる。
   * (1) タッチしてから指が離れるまでに移動がないこと
   * (2) タッチしてから指が離れるまでにジェスチャが入らないこと
   * (3) タッチしてから指が離れるまで0.5sec以内であること
   *
   * [ダブルタップ判定の条件]
   * 前回のタップから0.5sec以内にタップが発生した場合、ダブルタップイベントを発生させる。
   * 前回のタップとの位置関係は現在考慮していない。
   */

  var GestureManager =
  /*#__PURE__*/
  function () {
    function GestureManager(nd) {
      var _this = this;

      _classCallCheck(this, GestureManager);

      this.node = nd;
      this.tapWork = {
        touchX: null,
        touchY: null,
        touchTime: null
      };
      this.lastTap = null;
      this.gestureWork = {
        startPinchDistance: null,
        // gesture開始時の指の距離
        startAngle: 0,
        // gesture開始時の角度(度)
        startCenter: null // gesture開始時の中心座標

      };
      this.emulateGestureEvent = false;
      this.eventHandlers = {
        touchstart: function touchstart(event) {
          _this.touchStart(event);
        },
        touchmove: function touchmove(event) {
          _this.touchMove(event);
        },
        touchend: function touchend(event) {
          _this.touchEnd(event);
        },
        gesturestart: function gesturestart(event) {
          _this.gestureStart(event);
        },
        gesturechange: function gesturechange(event) {
          _this.gestureChange(event);
        },
        gestureend: function gestureend(event) {
          _this.gestureEnd(event);
        }
      };

      for (var evname in this.eventHandlers) {
        nd.addEventListener(evname, this.eventHandlers[evname], false);
      }

      var ua = navigator.userAgent.toLowerCase();

      if (ua.indexOf('android') != -1) {
        if (ua.match(/android\s+([0-9.]+)/)) {
          var osVersionString = RegExp.$1;

          if (parseFloat(osVersionString) >= 4.0) {
            this.emulateGestureEvent = true;
          }
        }
      }
    }

    _createClass(GestureManager, [{
      key: "unbindEvent",
      value: function unbindEvent() {
        for (var evname in this.eventHandlers) {
          this.node.removeEventListener(evname, this.eventHandlers[evname], false);
        }
      }
    }, {
      key: "gestureStart",
      value: function gestureStart(event) {
        var e = new Event('gesturestart');
        this.dispatchEvent(e);
      }
    }, {
      key: "gestureChange",
      value: function gestureChange(event) {
        //console.log(event.scale + ':' + event.rotation);
        var e = new Event('gesturechange');
        e.scale = event.scale;
        e.rotation = event.rotation;
        e.center = this.gestureWork.startCenter;
        this.dispatchEvent(e);
        event.preventDefault();
      }
    }, {
      key: "gestureEnd",
      value: function gestureEnd(event) {
        var e = new Event('gestureend');
        this.dispatchEvent(e);
      }
    }, {
      key: "touchStart",
      value: function touchStart(event) {
        var now = new Date();

        if (event.touches.length == 1) {
          this.tapWork.touchX = event.touches[0].clientX;
          this.tapWork.touchY = event.touches[0].clientY;
          this.tapWork.touchTime = now.getTime();
        } else {
          // ジェスチャーが入ったらtapはキャンセル      
          this.tapWork.touchTime = null;
        }

        if (event.touches.length == 2) {
          var vec = new Vector(event.touches[1].clientX - event.touches[0].clientX, event.touches[1].clientY - event.touches[0].clientY);
          this.gestureWork.startPinchDistance = vec.size;
          this.gestureWork.startAngle = vec.angle() * 180.0 / Math.PI;
          this.gestureWork.startCenter = new Vector((event.touches[1].clientX + event.touches[0].clientX) / 2, (event.touches[1].clientY + event.touches[0].clientY) / 2); // XXX Android4 ではマルチタッチは検出できるようになったが、gesture eventは発行されないので、擬似的に処理する

          if (this.emulateGestureEvent) {
            this.gestureStart(event);
          }
        }

        event.preventDefault(); // disable copy and paste
      }
    }, {
      key: "touchMove",
      value: function touchMove(event) {
        // 移動があったらtapはキャンセル(わずかな移動は許容)
        if (this.tapWork.touchTime && (Math.abs(event.touches[0].clientX - this.tapWork.touchX) > 3 || Math.abs(event.touches[0].clientY - this.tapWork.touchY) > 3)) {
          this.tapWork.touchTime = null;
        } // ピンチ時の中心座標


        if (event.touches.length >= 2) {
          if (this.emulateGestureEvent) {
            var vec = new Vector(event.touches[1].clientX - event.touches[0].clientX, event.touches[1].clientY - event.touches[0].clientY);
            var currentPinchDistance = vec.size;
            var currentAngle = vec.angle() * 180.0 / Math.PI;
            event.scale = currentPinchDistance / this.gestureWork.startPinchDistance;
            event.rotation = currentAngle - this.gestureWork.startAngle;
            this.gestureChange(event);
          }
        }

        event.preventDefault();
      }
    }, {
      key: "touchEnd",
      value: function touchEnd(event) {
        if (event.touches.length == 0 && this.tapWork.touchTime !== null) {
          var now = new Date();

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
              this.lastTap = {
                x: this.tapWork.touchX,
                y: this.tapWork.touchY,
                time: now.getTime()
              };
            } else {
              // 再タップでdoubletapが再度発生しないように、タップ情報はクリア
              this.lastTap = null;
            }
          }
        }

        if (this.emulateGestureEvent && event.touches.length == 1) {
          this.gestureEnd(event);
        }
      }
    }]);

    return GestureManager;
  }();
  mixinListener(GestureManager.prototype, 'listeners');

  var GestureManagerIE =
  /*#__PURE__*/
  function () {
    function GestureManagerIE(nd) {
      var _this = this;

      _classCallCheck(this, GestureManagerIE);

      this.node = nd;
      this.tapWork = {
        touchX: null,
        touchY: null,
        touchTime: null
      };
      this.gestureWork = {
        startPinchDistance: null,
        // gesture開始時の指の距離
        startAngle: 0,
        // gesture開始時の角度(度)
        startCenter: null,
        // gesture開始時の中心座標
        pointers: {}
      };
      this.emulateGestureEvent = false;
      this.eventHandlers = {
        MSPointerDown: function MSPointerDown(event) {
          _this.pointerDown(event);
        },
        MSPointerMove: function MSPointerMove(event) {
          _this.pointerMove(event);
        },
        MSPointerUp: function MSPointerUp(event) {
          _this.pointerUp(event);
        },
        MSPointerCancel: function MSPointerCancel(event) {
          _this.pointerUp(event);
        }
      };

      for (var evname in this.eventHandlers) {
        nd.addEventListener(evname, this.eventHandlers[evname], false);
      }
    }

    _createClass(GestureManagerIE, [{
      key: "unbindEvent",
      value: function unbindEvent() {
        for (var evname in this.eventHandlers) {
          this.node.removeEventListener(evname, this.eventHandlers[evname], false);
        }
      }
    }, {
      key: "pointerCount",
      value: function pointerCount() {
        var touchCnt = 0;

        for (var k in this.gestureWork.pointers) {
          touchCnt++;
        }

        return touchCnt;
      }
    }, {
      key: "gestureStart",
      value: function gestureStart(event) {
        var e = new Event('gesturestart');
        this.dispatchEvent(e);
      }
    }, {
      key: "gestureChange",
      value: function gestureChange(event) {
        var e = new Event('gesturechange');
        e.scale = event._scale;
        e.rotation = event._rotation;
        e.center = this.gestureWork.startCenter;
        this.dispatchEvent(e);
        event.preventDefault();
      }
    }, {
      key: "gestureEnd",
      value: function gestureEnd(event) {
        var e = new Event('gestureend');
        this.dispatchEvent(e);
      }
    }, {
      key: "pointerDown",
      value: function pointerDown(event) {
        event.preventDefault();
        this.gestureWork.pointers[event.pointerId] = {
          clientX: event.clientX,
          clientY: event.clientY
        };
        var pointerCnt = this.pointerCount();
        var now = new Date();

        if (pointerCnt == 1) {
          this.tapWork.touchX = event.clientX;
          this.tapWork.touchY = event.clientY;
          this.tapWork.touchTime = now.getTime();
        } else {
          // ジェスチャーが入ったらtapはキャンセル      
          this.tapWork.touchTime = null;
        } // 2本指になったらジェスチャ開始


        if (pointerCnt == 2) {
          var pointers = [];

          for (var pid in this.gestureWork.pointers) {
            pointers.push(this.gestureWork.pointers[pid]);
          }

          var vec = new Vector(pointers[1].clientX - pointers[0].clientX, pointers[1].clientY - pointers[0].clientY);
          this.gestureWork.startPinchDistance = vec.size;
          this.gestureWork.startAngle = vec.angle() * 180.0 / Math.PI;
          this.gestureWork.startCenter = new Vector((pointers[1].clientX + pointers[0].clientX) / 2, (pointers[1].clientY + pointers[0].clientY) / 2);
          this.gestureStart(event);
        }

        event.preventDefault();
      }
    }, {
      key: "pointerMove",
      value: function pointerMove(event) {
        var pointer = this.gestureWork.pointers[event.pointerId];
        if (!pointer) return; // 移動があったらtapはキャンセル(わずかな移動は許容)

        if (this.tapWork.touchTime && (Math.abs(event.clientX - this.tapWork.touchX) > 10 || Math.abs(event.clientY - this.tapWork.touchY) > 10)) {
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

          var vec = new Vector(pointers[1].clientX - pointers[0].clientX, pointers[1].clientY - pointers[0].clientY);
          var currentPinchDistance = vec.size;
          var currentAngle = vec.angle() * 180.0 / Math.PI;
          event._scale = currentPinchDistance / this.gestureWork.startPinchDistance;
          event._rotation = currentAngle - this.gestureWork.startAngle;
          this.gestureChange(event);
        }

        event.preventDefault();
      }
    }, {
      key: "pointerUp",
      value: function pointerUp(event) {
        delete this.gestureWork.pointers[event.pointerId];
        var pointerCnt = this.pointerCount();

        if (pointerCnt == 0 && this.tapWork.touchTime !== null) {
          var now = new Date();

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
              this.lastTap = {
                x: this.tapWork.touchX,
                y: this.tapWork.touchY,
                time: now.getTime()
              };
            } else {
              // 再タップでdouble_tapが再度発生しないように、タップ情報はクリア
              this.lastTap = null;
            }
          }
        } // 1本指になったらジェスチャ停止


        if (pointerCnt == 1) {
          this.gestureEnd(event);
        }
      }
    }]);

    return GestureManagerIE;
  }();
  mixinListener(GestureManagerIE.prototype, 'listeners');

  /*
   * GestureManager
   *
   * Copyright (c) 2019 Kazuyoshi Tomita
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */
  function createGestureManager(element) {
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

  exports.createGestureManager = createGestureManager;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=gesture-manager.js.map
