import Vector from './vector.js';
import Event from './event.js';
import mixinListener from './listener.js';

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

export default class GestureManager {
  constructor(nd) {
    this.node = nd;
    this.tapWork = {touchX: null,
                    touchY: null,
                    touchTime: null,
                   };
    this.lastTap = null;
    this.gestureWork = {startPinchDistance: null, // gesture開始時の指の距離
                        startAngle: 0,            // gesture開始時の角度(度)
                        startCenter: null,        // gesture開始時の中心座標
                       };
    this.emulateGestureEvent = false;

    this.eventHandlers = {touchstart: (event) => {this.touchStart(event)},
                          touchmove:  (event) => {this.touchMove(event)},
                          touchend:   (event) => {this.touchEnd(event)},
                          gesturestart:  (event) => {this.gestureStart(event)},
                          gesturechange: (event) => {this.gestureChange(event)},
                          gestureend:    (event) => {this.gestureEnd(event)}};
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

  unbindEvent() {
    for (var evname in this.eventHandlers) {
      this.node.removeEventListener(evname, this.eventHandlers[evname], false);
    }
  }

  gestureStart(event) {
    var e = new Event('gesturestart');
    this.dispatchEvent(e);
  }

  gestureChange(event) {
    //console.log(event.scale + ':' + event.rotation);
    var e = new Event('gesturechange');
    e.scale = event.scale;
    e.rotation = event.rotation;
    e.center = this.gestureWork.startCenter;
    this.dispatchEvent(e);

    event.preventDefault();
  }

  gestureEnd(event) {
    var e = new Event('gestureend');
    this.dispatchEvent(e);
  }


  touchStart(event) {

    var now = new Date;
    if (event.touches.length == 1) {
      this.tapWork.touchX = event.touches[0].clientX;
      this.tapWork.touchY = event.touches[0].clientY;
      this.tapWork.touchTime = now.getTime();
    } else {
      // ジェスチャーが入ったらtapはキャンセル      
      this.tapWork.touchTime = null;
    }

    if (event.touches.length == 2) {
      var vec = new Vector(event.touches[1].clientX - event.touches[0].clientX,
                           event.touches[1].clientY - event.touches[0].clientY);
      this.gestureWork.startPinchDistance = vec.size;
      this.gestureWork.startAngle = vec.angle() * 180.0 / Math.PI;
      this.gestureWork.startCenter = new Vector((event.touches[1].clientX + event.touches[0].clientX) / 2,
                                                (event.touches[1].clientY + event.touches[0].clientY) / 2);
      // XXX Android4 ではマルチタッチは検出できるようになったが、gesture eventは発行されないので、擬似的に処理する
      if (this.emulateGestureEvent) {
        this.gestureStart(event);
      }
    }

    event.preventDefault(); // disable copy and paste
  }

  touchMove(event) {
    // 移動があったらtapはキャンセル(わずかな移動は許容)
    if (this.tapWork.touchTime &&
        (Math.abs(event.touches[0].clientX - this.tapWork.touchX) > 3 ||
         Math.abs(event.touches[0].clientY - this.tapWork.touchY) > 3)) {
      this.tapWork.touchTime = null;
    }

    // ピンチ時の中心座標
    if (event.touches.length >= 2) {
      if (this.emulateGestureEvent) {
        var vec = new Vector(event.touches[1].clientX - event.touches[0].clientX,
                             event.touches[1].clientY - event.touches[0].clientY);
        var currentPinchDistance = vec.size;
        var currentAngle = vec.angle() * 180.0 / Math.PI;
        event.scale = currentPinchDistance / this.gestureWork.startPinchDistance;
        event.rotation = currentAngle - this.gestureWork.startAngle;
        this.gestureChange(event);
      }
    }

    event.preventDefault();
  }

  touchEnd(event) {

    if (event.touches.length == 0 && this.tapWork.touchTime !== null) {
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
          // 再タップでdoubletapが再度発生しないように、タップ情報はクリア
          this.lastTap = null;
        }
      }
    }

    if (this.emulateGestureEvent && event.touches.length == 1) {
      this.gestureEnd(event);
    }
  }
}

mixinListener(GestureManager.prototype, 'listeners');
