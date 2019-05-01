(function () {
  function log(msg) {
    var messages = document.getElementById('messages');
    var p = document.createElement('p');
    p.innerHTML += msg;
    messages.appendChild(p);

    var footer = document.getElementById('footer');
    while (footer.scrollHeight > footer.offsetHeight) {
      messages.removeChild(messages.children[0]);
    }
  }

  function round(value) {
    return parseInt(value * 100, 10) / 100;
  }

  window.onload = function () {
    var manager = GestureManager.createGestureManager('#screen');
    manager.addEventListener('doubletap', function () {
      log('doubletap');
    });
    manager.addEventListener('gesturestart', function (e) {log('gesturestart');});
    manager.addEventListener('gesturechange', function (e) {
      log('gesturechange: scale ' + round(e.scale) + ', rotation ' + round(e.rotation) + ' degree, center.x ' + round(e.center.x) + ', .y ' + round(e.center.y));

      var text = document.getElementById("text");
      text.style.transform = 'scale(' + e.scale + ',' + e.scale + ') ' + 'rotate(' + e.rotation + 'deg)';
    });

    manager.addEventListener('gestureend', function (e) {
      log('gestureend');
      var text = document.getElementById("text");
      text.style.transform = '';
    });
  }
})();

