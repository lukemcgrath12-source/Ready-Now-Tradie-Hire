/* Shared helpers: "ready now today" availability and profile QR codes. */
(function () {
  var RN = window.RN = window.RN || {};
  var availP = null;
  RN.available = function () {
    if (!availP) availP = fetch('/api/available', {headers: {'Accept': 'application/json'}})
      .then(function (r) { return r.ok ? r.json() : {ids: []}; })
      .then(function (d) { return new Set((d && d.ids) || []); })
      .catch(function () { return new Set(); });
    return availP;
  };
  var qrP = null;
  function loadQr() {
    if (window.qrcode) return Promise.resolve(window.qrcode);
    if (!qrP) qrP = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = '/qrcode.js'; s.onload = function () { res(window.qrcode); }; s.onerror = rej; document.head.appendChild(s);
    });
    return qrP;
  }
  // Draws a QR code for text onto a new canvas, size px square, with a quiet zone.
  RN.qrCanvas = function (text, size) {
    return loadQr().then(function (qrcode) {
      var q = qrcode(0, 'M'); q.addData(text); q.make();
      var n = q.getModuleCount(), quiet = 4, cell = Math.floor(size / (n + quiet * 2)) || 1;
      var px = cell * (n + quiet * 2), c = document.createElement('canvas');
      c.width = px; c.height = px; c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'QR code for ' + text);
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, px, px); g.fillStyle = '#16181B';
      for (var r = 0; r < n; r++) for (var col = 0; col < n; col++) if (q.isDark(r, col)) g.fillRect((col + quiet) * cell, (r + quiet) * cell, cell, cell);
      return c;
    });
  };
  RN.downloadCanvas = function (canvas, name) {
    var a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  };
})();
