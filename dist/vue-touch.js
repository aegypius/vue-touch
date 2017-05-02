(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('hammerjs')) :
	typeof define === 'function' && define.amd ? define(['hammerjs'], factory) :
	(global.VueTouch = factory(global.Hammer));
}(this, (function (Hammer) { 'use strict';

Hammer = 'default' in Hammer ? Hammer['default'] : Hammer;

function assign(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }
  for (var i = 0; i < sources.length; i++) {
    var source = sources[i];
    var keys = Object.keys(source);
    for (var _i = 0; _i < keys.length; _i++) {
      var key = keys[_i];
      target[key] = source[key];
    }
  }
  return target;
}
function createProp() {
  return {
    type: Object,
    default: function _default() {
      return {};
    }
  };
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
var directions = ['up', 'down', 'left', 'right', 'horizontal', 'vertical', 'all'];
function guardDirections(options) {
  var dir = options.direction;
  if (typeof dir === 'string') {
    var hammerDirection = 'DIRECTION_' + dir.toUpperCase();
    if (directions.indexOf(dir) > -1 && Hammer.hasOwnProperty(hammerDirection)) {
      options.direction = Hammer[hammerDirection];
    } else {
      console.warn('[vue-touch] invalid direction: ' + dir);
    }
  }
  return options;
}
var config = {};
var customEvents = {};
var gestures = ['pan', 'panstart', 'panmove', 'panend', 'pancancel', 'panleft', 'panright', 'panup', 'pandown', 'pinch', 'pinchstart', 'pinchmove', 'pinchend', 'pinchcancel', 'pinchin', 'pinchout', 'press', 'pressup', 'rotate', 'rotatestart', 'rotatemove', 'rotateend', 'rotatecancel', 'swipe', 'swipeleft', 'swiperight', 'swipeup', 'swipedown', 'tap'];
var gestureMap = {
  pan: 'pan',
  panstart: 'pan',
  panmove: 'pan',
  panend: 'pan',
  pancancel: 'pan',
  panleft: 'pan',
  panright: 'pan',
  panup: 'pan',
  pandown: 'pan',
  pinch: 'pinch',
  pinchstart: 'pinch',
  pinchmove: 'pinch',
  pinchend: 'pinch',
  pinchcancel: 'pinch',
  pinchin: 'pinch',
  pinchout: 'pinch',
  press: 'press',
  pressup: 'press',
  rotate: 'rotate',
  rotatestart: 'rotate',
  rotatemove: 'rotate',
  rotateend: 'rotate',
  rotatecancel: 'rotate',
  swipe: 'swipe',
  swipeleft: 'swipe',
  swiperight: 'swipe',
  swipeup: 'swipe',
  swipedown: 'swipe',
  tap: 'tap'
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
var Component = {
  props: {
    options: createProp(),
    tapOptions: createProp(),
    panOptions: createProp(),
    pinchOptions: createProp(),
    pressOptions: createProp(),
    rotateOptions: createProp(),
    swipeOptions: createProp(),
    tag: { type: String, default: 'div' },
    enabled: {
      default: true,
      type: [Boolean, Object]
    }
  },
  mounted: function mounted() {
    if (!this.$isServer) {
      this.hammer = new Hammer.Manager(this.$el, this.options);
      this.recognizers = {};
      this.setupBuiltinRecognizers();
      this.setupCustomRecognizers();
      this.updateEnabled(this.enabled);
    }
  },
  destroyed: function destroyed() {
    if (!this.$isServer) {
      this.hammer.destroy();
    }
  },
  watch: {
    enabled: {
      deep: true,
      handler: function handler() {
        this.updateEnabled.apply(this, arguments);
      }
    }
  },
  methods: {
    setupBuiltinRecognizers: function setupBuiltinRecognizers() {
      for (var i = 0; i < gestures.length; i++) {
        var gesture = gestures[i];
        if (this._events[gesture]) {
          var mainGesture = gestureMap[gesture];
          var options = assign({}, config[mainGesture] || {}, this[mainGesture + 'Options']);
          this.addRecognizer(mainGesture, options);
          this.addEvent(gesture);
        }
      }
    },
    setupCustomRecognizers: function setupCustomRecognizers() {
      var gestures$$1 = Object.keys(customEvents);
      for (var i = 0; i < gestures$$1.length; i++) {
        var gesture = gestures$$1[i];
        if (this._events[gesture]) {
          var opts = customEvents[gesture];
          var localCustomOpts = this[gesture + 'Options'] || {};
          var options = assign({}, opts, localCustomOpts);
          this.addRecognizer(gesture, options, { mainGesture: options.type });
          this.addEvent(gesture);
        }
      }
    },
    addRecognizer: function addRecognizer(gesture, options) {
      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          mainGesture = _ref.mainGesture;
      if (!this.recognizers[gesture]) {
        var recognizer = new Hammer[capitalize(mainGesture || gesture)](guardDirections(options));
        this.recognizers[gesture] = recognizer;
        this.hammer.add(recognizer);
        recognizer.recognizeWith(this.hammer.recognizers);
      }
    },
    addEvent: function addEvent(gesture) {
      var _this = this;
      this.hammer.on(gesture, function (e) {
        return _this.$emit(gesture, e);
      });
    },
    updateEnabled: function updateEnabled(newVal, oldVal) {
      if (newVal === true) {
        this.enableAll();
      } else if (newVal === false) {
        this.disableAll();
      } else if ((typeof newVal === 'undefined' ? 'undefined' : _typeof(newVal)) === 'object') {
        var keys = Object.keys(newVal);
        for (var i = 0; i < keys.length; i++) {
          var event = keys[i];
          if (this.recognizers[event]) {
            newVal[event] ? this.enable(event) : this.disable(event);
          }
        }
      }
    },
    enable: function enable(r) {
      var recognizer = this.recognizers[r];
      if (!recognizer.options.enable) {
        recognizer.set({ enable: true });
      }
    },
    disable: function disable(r) {
      var recognizer = this.recognizers[r];
      if (recognizer.options.enable) {
        recognizer.set({ enable: false });
      }
    },
    toggle: function toggle(r) {
      var recognizer = this.recognizers[r];
      if (recognizer) {
        recognizer.options.enable ? this.disable(r) : this.enable(r);
      }
    },
    enableAll: function enableAll(r) {
      this.toggleAll({ enable: true });
    },
    disableAll: function disableAll(r) {
      this.toggleAll({ enable: false });
    },
    toggleAll: function toggleAll(_ref2) {
      var enable = _ref2.enable;
      var keys = Object.keys(this.recognizers);
      for (var i = 0; i < keys.length; i++) {
        var r = this.recognizers[keys[i]];
        if (r.options.enable !== enable) {
          r.set({ enable: enable });
        }
      }
    },
    isEnabled: function isEnabled(r) {
      return this.recognizers[r] && this.recognizers[r].options.enable;
    }
  },
  render: function render(h) {
    return h(this.tag, {}, this.$slots.default);
  }
};

var installed = false;
var vueTouch = { config: config, customEvents: customEvents };
vueTouch.install = function install(Vue) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var name = opts.name || 'v-touch';
  Vue.component(name, assign(Component, { name: name }));
  installed = true;
}.bind(vueTouch);
vueTouch.registerCustomEvent = function registerCustomEvent(event) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (installed) {
    console.warn('\n      [vue-touch]: Custom Event \'' + event + '\' couldn\'t be added to vue-touch.\n      Custom Events have to be registered before installing the plugin.\n      ');
    return;
  }
  options.event = event;
  customEvents[event] = options;
  Component.props[event + 'Options'] = {
    type: Object,
    default: function _default() {
      return {};
    }
  };
}.bind(vueTouch);
vueTouch.component = Component;

return vueTouch;

})));
//# sourceMappingURL=vue-touch.js.map
