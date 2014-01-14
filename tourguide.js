(function (window) {
    'use strict';

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (str) {
            return this.slice(0, str.length) == str;
        };
    }

var PLAQUE_TEMPLATE =
    '<div class="plaque">' +
        '<div class="plaque-title js-plaque-title"></div>' +
        '<div class="plaque-message js-plaque-message"></div>' +
        '<span class="plaque-stopNumber js-plaque-stopNumber"></span> of ' +
        '<span class="plaque-totalStops js-plaque-totalStops"></span>' +
        '<div>' +
            '<span class="js-tourGuide-previous">prev</span>' +
            '<span class="js-tourGuide-next">next</span>' +
        '</div>' +
    '</div>'
;

var Plaque = function (totalStops) {
    this.$el = $(PLAQUE_TEMPLATE).appendTo('body');
    this.$headline = this.$el.find('.js-plaque-title');
    this.$message = this.$el.find('.js-plaque-message');
    this.$stopNumber = this.$el.find('.js-plaque-stopNumber');
    this.$totalStops = this.$el.find('.js-plaque-totalStops').text(totalStops);
    this.arrowClass = '';
};

Plaque.prototype.open = function (positionOfStop, centerOfStop, sizeOfStop, headline, message, stopNumber) {
    // Call update first so the element is resized with new content before gettings it's size checked.
    this.update(headline, message, stopNumber);

    var $elHeight = this.$el.outerHeight();
    var $elWidth = this.$el.outerWidth();
    var gaps = {
        top: positionOfStop.top - $elHeight,
        right: positionOfStop.right - $elWidth,
        bottom: positionOfStop.bottom - $elHeight,
        left: positionOfStop.left - $elWidth
    };

    var optimalSide = this._getOptimalSide(gaps);
    var top, left, arrowClass;
    switch (optimalSide) {
        case 'top':
            top = positionOfStop.top - $elHeight + 'px';
            left = centerOfStop.left - ($elWidth / 2) + 'px';
            arrowClass = 'plaque_above';
            break;

        case 'right':
            top = centerOfStop.top - ($elHeight / 2) + 'px';
            left = positionOfStop.left + sizeOfStop.width + 'px';
            arrowClass = 'plaque_right';
            break;

        case 'bottom':
            top = positionOfStop.top + sizeOfStop.height + 'px';
            left = centerOfStop.left - ($elWidth / 2) + 'px';
            arrowClass = 'plaque_below';
            break;

        case 'left':
            top = centerOfStop.top - ($elHeight / 2) + 'px';
            left = positionOfStop.left - $elWidth + 'px';
            arrowClass = 'plaque_left';
            break;
    }

    this.$el.css({
        top  : top,
        left : left
    }).removeClass(this.arrowClass).addClass(arrowClass).fadeIn(250);

    this.arrowClass = arrowClass;

    return this;
};

Plaque.prototype.close = function () {
    this.$el.hide();
    return this;
};

Plaque.prototype.update = function (headline, message, stopNumber) {
    this.$headline.text(headline);
    this.$message.text(message);
    this.$stopNumber.text(stopNumber);

    return this;
};

Plaque.prototype._getOptimalSide = function (gaps) {
    var optimalSide = null;
    var largestGap = -1;
    for (var side in gaps) {
        if (gaps.hasOwnProperty(side)) {
            var value = gaps[side];
            if (value > largestGap) {
                optimalSide = side;
                largestGap = value;
            }
        }
    }
    return optimalSide;
};

var MINIMUM_SCALE = 1.5;
var ANIMATION_DURATION = 250;

var PINHOLE_PATH = 'M0,0v2000h2000V0H0z ' +  // Extra space is intentional
                   'M1000,1025c-13.807,0-25-11.193-25-25s11.193-25,25-25s25,11.193,25,25S1013.807,1025,1000,1025z';


// Object representing a spotlight for the tour.
var Spotlight = function () {
    this.snap = window.Snap(2000, 2000).attr({
        'id': 'spotlight',
        'class': 'spotlight'
    });
    this.$el = $(this.snap.node);


    // this.filterBlur = this.snap.paper.filter('<feGaussianBlur stdDeviation="2"/>');
    // For the filter effect apply to pinHole -> `filter: this.filterBlur`
    this.pinHole = this.snap.path(PINHOLE_PATH).attr({
        'fill': '#222222',
        'fill-opacity': '0.8'
    });
};

Spotlight.prototype.move = function (center, size) {
    var d = $.Deferred();

    this._zoom(size);
    this.$el
        .stop(false, false)
        .transition({
            'top': center.top - (this.$el.height() / 2),
            'left': center.left - (this.$el.width() / 2)
        }, ANIMATION_DURATION, 'snap', d.resolve);

    return d.promise();
};

Spotlight.prototype.on = function () {
    var d = $.Deferred();
    // Add the svg node and then fade in
    this.$el
        .css({'opacity': 0})
        .appendTo('body')
        .animate({'opacity': 1}, 750, 'swing', d.resolve);

    return d.promise();
};

Spotlight.prototype.off = function () {
    // Fadeout the svg node and then detach
    this.$el.transit({'opacity': 0}, 250, 'snap', this.$el.detach);
};

// Should not be called directly.
Spotlight.prototype._zoom = function (size) {
    var scale = Math.max(size.width, size.height) * (0.033);
    scale = scale < MINIMUM_SCALE ? MINIMUM_SCALE : scale;
    this.$el.transition({'scale': scale}, ANIMATION_DURATION, 'snap');
};

// Object representing a single stop on the tour.
var Stop = function (stopData) {
    // Main text.
    this.headline = stopData.headline || '';
    // Supporting copy.
    this.message = stopData.message || '';

    this.$el = $(stopData.selector);

    if (this.$el.length !== 1) {
        throw new Error(
            "The stop '" + this.headline + " - " + this.message +
            "' is not present in the DOM, or more than one node was found."
        );
    }

    this._updatePositionalData();
};

Stop.prototype.update = function () {
    this._updatePositionalData();
};

Stop.prototype._updatePositionalData = function () {
    // {width, height} of the $el including borders.
    this.sizeOf$el = { width: this.$el.outerWidth(), height: this.$el.outerHeight() };

    // {top, right, bottom, left} of the $el relative to the document.
    this.positionOf$el = this.$el.offset();
    this.positionOf$el.top = parseInt(this.positionOf$el.top);
    this.positionOf$el.right = parseInt($(document).width() - (this.positionOf$el.left + this.sizeOf$el.width));
    this.positionOf$el.bottom = parseInt($(document).height() - (this.positionOf$el.top + this.sizeOf$el.height));
    this.positionOf$el.left = parseInt(this.positionOf$el.left);

    // {top, left} center point of the $el relative to the document.
    this.centerOf$el = {
        top: (this.sizeOf$el.height / 2) + this.positionOf$el.top,
        left: (this.sizeOf$el.width / 2) + this.positionOf$el.left
    };
};

// Index to start the tour at.
var FIRST_STOP = 0;


// Object representing a tour.
var Tour = function (stops, firstStop) {
    if (!stops) {
        throw new Error("You can't schedule a tour without any stops.");
    }
    firstStop = firstStop || FIRST_STOP;

    this.schedule(stops).start(firstStop);
};

// This essentially acts a builder for tours.
Tour.prototype.schedule = function (stops) {
    this.currentStop = null;

    var _stops = [];
    stops.forEach(function (stop) {
        if (!stop.selector.startsWith('#')) throw new Error("The stop selector must be an id.");
        _stops.push(new Stop(stop));
    });
    this.stops = _stops;

    this.plaque = new Plaque(this.stops.length);
    this.spotlight = new Spotlight();

    return this;
};

// Start the tour.
Tour.prototype.start = function (firstStop) {
    this.currentStop = firstStop;
    this.transitionToSpot(this.currentStop);

    this.tourIsStarted = true;

    return this;
};

// Update each stop's position data on the tour.
// Call this after a window.resize event
Tour.prototype.updateSchedule = function () {
    this.stops.forEach(function (stop) {
        stop.update();
    });
    this.transitionToSpot(this.currentStop);
};

// Jump to any stop on the tour.
Tour.prototype.transitionToSpot = function (stopIndex) {
    var stop = this.stops[stopIndex];
    var plaque = this.plaque;

    plaque.close();
    this.spotlight.move(
        stop.centerOf$el,
        stop.sizeOf$el
    ).then(function () {
        plaque.open(
            stop.positionOf$el, stop.centerOf$el, stop.sizeOf$el,
            stop.headline, stop.message, stopIndex + 1
        );
    });
};

// Convenience method.
// Move to the next stop on the tour.
Tour.prototype.nextStop = function () {
    if (this.currentStop === (this.stops.length - 1)) return;  // If there is no next stop.

    this.currentStop = this.currentStop + 1;
    this.transitionToSpot(this.currentStop);
};

// Convenience method.
// Move to the previous stop on the tour.
Tour.prototype.previousStop = function () {
    if (this.currentStop === 0) return;  // If there is no previous stop.

    this.currentStop = this.currentStop - 1;
    this.transitionToSpot(this.currentStop);
};

Tour.prototype.resume = function () {
    if (this.tourIsStarted) return this;
    this.updateSchedule();
    this.spotlight.on();
    this.tourIsStarted = true;
};

Tour.prototype.cancel = function () {
    if (!this.tourIsStarted) return this;
    this.spotlight.off();
    this.plaque.close();
    this.tourIsStarted = false;
};

    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        module.exports = TourGuide;
    } else {
        if ( typeof define === "function" && define.amd ) {
            define( "tourguide", [], function () { return tourguide; } );
        }
    }

    if ( typeof window === "object" && typeof window.document === "object" ) {
        window.TourGuide = Tour;
    }
})(window);
