$(document).ready(function () {
    'use strict';

    // Fixture data.
    var STOPS = window.STOPS = [{
        'selector': '#one',
        'headline': "My Account",
        'message': "Bacon ipsum dolor sit amet tongue pancetta chuck boudin turducken swine. Shankle tail spare ribs bacon sirloin, ribeye boudin pig ball tip pork loin andouille leberkas tri-tip ham hock pork."
    }, {
        'selector': '#two',
        'headline': "Top Headlines",
        'message': "Beef ribs capicola turducken frankfurter boudin, pastrami bresaola prosciutto pig sausage."
    }, {
        'selector': '#three',
        'headline': "Jump to a Category",
        'message': "Salvia four loko XOXO, Intelligentsia lo-fi keffiyeh skateboard polaroid."
    }, {
        'selector': '#four',
        'setup': {
            'selector': '#three',
            'event': 'click'
        },
        'headline': "osidhfosdihfosdihofsih.",
        'message': "amber, microbrewery abbey hydrometer, brewpub ale lauter tun saccharification oxidized barrel. berliner weisse wort chiller adjunct hydrometer alcohol aau!"
    }, {
        'selector': '#five',
        'setup': {
            'selector': '#three',
            'class': 'active'
        },
        'headline': "osidhfosdihfosdihofsih.",
        'message': "amber, microbrewery abbey hydrometer, brewpub ale lauter tun saccharification oxidized barrel. berliner weisse wort chiller adjunct hydrometer alcohol aau!"
    }, {
        'selector': '#six',
        'headline': "osidhfosdihfosdihofsih.",
        'message': "amber, microbrewery abbey hydrometer, brewpub ale lauter tun saccharification oxidized barrel. berliner weisse wort chiller adjunct hydrometer alcohol aau!"
    }, {
        'selector': '#seven',
        'setup': {
            'selector': '#seven',
            'event': 'hover'
        },
        'headline': "Yeahhwefw  ewf hwefwerwe hhhhhh",
        'message': "Woooooo ooooooooooooooowef wf wef oo fwoooooooooo  oaosiuwe ffiuawef sgdfiug asdfiugasdfi ugasdfiug asdifug asdiuf gasidufg iusdfgiasu dfgiuas gfiusadg fiug "
    }];


    var LEFT_KEY  = 37;  // Key `which` for left key.
    var RIGHT_KEY = 39;  // Key `which` for right key.


    var Website = function () {
        this.tourGuide = new TourGuide(STOPS);
        this.bind().enable();
    };

    Website.prototype.bind = function () {
        this.onKeyUpHandler = this.onKeyUp.bind(this);
        this.moveToPreviousHandler = this.moveToPrevious.bind(this);
        this.moveToNextHandler = this.moveToNext.bind(this);

        this.onWindowResizeHandler = this.onWindowResize.bind(this);

        return this;
    };

    Website.prototype.enable = function () {
        $(document).on('keyup', this.onKeyUpHandler);
        $(document.body).on('click', '.js-tourGuide-next', this.moveToNextHandler);
        $(document.body).on('click', '.js-tourGuide-previous', this.moveToPreviousHandler);

        $(window).on('resize', this.onWindowResizeHandler);

        return this;
    };

    Website.prototype.onKeyUp = function (event) {
        if (event.which === LEFT_KEY) this.moveToPreviousHandler(event);
        if (event.which === RIGHT_KEY) this.moveToNextHandler(event);
    };

    Website.prototype.moveToPrevious = function (event) {
        event.preventDefault();
        this.tourGuide.previousStop();
    };

    Website.prototype.moveToNext = function (event) {
        event.preventDefault();
        this.tourGuide.nextStop();
    };

    Website.prototype.onWindowResize = function (event) {
        this.tourGuide.updateSchedule();
    };



    $('#three').on('click', function (event) {
        $('#four').toggle();
    });



    window.website = new Website();
});
