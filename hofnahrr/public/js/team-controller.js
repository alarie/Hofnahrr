/*global define*/
define([
    'jquery', 'underscore', 'backbone', 
    'templater',

    'text!tmpl/layouts/team.tmpl',
], function (
    $, _, Backbone, Templater,

    tmplTeamLayout
) {
    'use strict';

    var TeamController;

    TeamController = {
        init : function () {
            _.bindAll(this, 'setBackgroundImage', 'initTeamLayout', 'onOpenTeam');

            this._teamControllerInstalled = true;
        
            this.layouts.team = tmplTeamLayout;

            this.on('layout-set:team', this.initTeamLayout);
        },

        initTeamLayout : function () {
            $('body').addClass('green');
        },

        onOpenTeam : function () {
            this.setLayout('team');


            // debugging canvas
            {
                var c = $('<canvas/>'),
                    w = $('body').outerWidth(true),
                    h = $('body').outerHeight(true);

                c.css({
                    width : w,
                    height : h,
                    top : 0,
                    left: 0,
                    position: 'absolute',
                    zIndex : -1
                });

                $('body').append(c);

                c.attr({height : h, width: w});
                this.ctx = c[0].getContext('2d');
            }

            $('body').on('mousemove', this.setBackgroundImage);
        },

        getImageData : function (elem) {
            var image = $(elem).find('.fotorahmen'),
                imagePos = image.offset();

            return {
                left : imagePos.left,
                top : imagePos.top,
                width : 200, 
                height : 247
            };
        },

        isIn : function (top, left, bottom, right, e) {
            var hit =  (e.pageX > left) && 
                    (e.pageX < right) && 
                    (e.pageY > top) && 
                    (e.pageY < bottom);

            if (hit) {
                this.ctx.fillRect(left, top, right - left, bottom - top);
            }
            return hit;
        },

        setBackgroundImage : function (e) {
            var that = this,
                imageHeight = 247,
                imageWidth = 200,
                hMax = $('body').outerWidth(true),
                vMax = $('body').outerHeight(true);

            this.ctx.clearRect(0, 0, hMax, vMax);

            $('#team .col').each(function (i) {
                var imageData = that.getImageData(this),
                    h1 = imageData.left,
                    v1 = imageData.top,
                    h2 = h1 + imageData.width,
                    v2 = v1 + imageData.height,
                    pos;

                if (i === 0) {
                    that.ctx.fillStyle = 'rgba(38, 157, 46, 0.05)';
                }
                else if (i === 1) {
                    that.ctx.fillStyle = 'rgba(87, 35, 129, 0.05)';
                }
                else {
                    that.ctx.fillStyle = 'rgba(236, 116, 5, 0.05)';
                }

                if (that.isIn(v1, h1, v2, h2, e)) {
                    pos = -8 * imageHeight;
                }
                else {
                    // oben links
                    if (that.isIn(0, 0, v1, h1, e)) {
                        pos = -1 * imageHeight;
                    }
                    // oben Mitte
                    else if (that.isIn(0, h1, v1, h2, e)) {
                        pos = 0 * imageHeight;
                    }
                    // oben Rechts
                    else if (that.isIn(0, h2, v1, hMax, e)) {
                        pos = -2 * imageHeight;
                    }
                    // Mitte Links
                    else if (that.isIn(v1, 0, v2, h1, e)) {
                        pos = -6 * imageHeight;
                    }
                    //Mitte rechts
                    else if (that.isIn(v1, h2, v2, hMax, e)) {
                        pos = -7 * imageHeight;
                    }
                    //unten links
                    else if (that.isIn(v2, 0, vMax, h1, e)) {
                        pos = -4 * imageHeight;
                    }
                    //unten mitte
                    else if (that.isIn(v2, h1, vMax, h2, e)) {
                        pos = -3 * imageHeight;
                    }
                    // unten rechts
                    else if (that.isIn(v2, h2, vMax, hMax, e)) {
                        pos = -5 * imageHeight;
                    }
                }

                $(this).find('.fotorahmen')
                    .css('background-position', -i * imageWidth + 'px ' + pos + 'px');
            });
        }
    };

    return {
        installTo : function (target) {
            _.extend(target, TeamController);
            TeamController.init.apply(target);
        }
    };
});
