(function (global) {
  var KEY = "uxr-readiness-v1";

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  global.UXR_STORAGE = { KEY: KEY, load: load, save: save, clear: clear };
})(window);
