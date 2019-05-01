export default function mixinListener(object, prop) {
  object[prop] = {};

  // メソッドを登録
  object.addEventListener = function (name, func) {
    if (!object[prop][name]) {
      object[prop][name] = new ListenerList;
    }
    object[prop][name].addListener(func);
  }
  object.removeEventListener = function (name, func) {
    if (!object[prop][name])
      return;
    object[prop][name].removeListener(func);
  }
  object.dispatchEvent = function (event) {
    if (!object[prop][event.name])
      return;
    object[prop][event.name].fire(event);
  }
}

class ListenerList {
  constructor() {
    this.list = [];
  }

  addListener(func) {
    this.list.push(func);
  }

  removeListener(func) {
    for (var i = 0 ; i < this.list.length ; i++) {
      if (this.list[i] == func) {
        this.list.splice(i, 1);
        return;
      }
    }
  }

  fire() {
    for (var i = 0 ; i < this.list.length ; i++) {
      (this.list[i]).apply(this, arguments);
    }
  }
}
