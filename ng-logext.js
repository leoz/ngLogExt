/*
    Extended Angular logging
    Authors: Rob Anderson (@iotaweb), Leonid Zolotarev <leoz@yahoo.com>
    Adds ability to turn on/off all logging messages
    Adds abiity to specify logging levels
    Adds support for console.table()
    Adds support for using controller name (or alias) as context
    Prepends logs with timestamp (nicely padded)
    Doesn't mess with array (preserves nascent string substitution), e.g. $log.info('This is a %s', message)
    Nicely formatted for easy reading (context padded to consistent width [optional])
    Dependencies:
        lodash.js http://lodash.com/docs
        moment.js http://momentjs.com/
    Examples of use:
        Standard logging, e.g.
            $log.info('This is a message');
            > 10:53:23:798  This is a message
        Enhanced logging with context, e.g.
            var log = $log.context('login') // OR
            var log = $log.context($scope.controllerName); // optional for controllers
            log.info('This is a message');
            log.table('Array',[5,10,15,20]);
            > 10:53:23:798  [login]   This is a message
    JsFiddle: http://jsfiddle.net/RobAnderson/v9yLauzh/4/
    Known issues:
        $log doesn't show the filename or line number number or where the log originated.
        No known work around yet (angular issue). This limits the value of $log IMHO.
*/
(function () {
    'use strict';

    angular
        .module('ngLogExt', [])
        .constant('DEBUG', true)
        .constant('LEVELS', ['debug','log','info','warn','error','table'])
        .config(['$logProvider', '$provide', 'DEBUG', 'LEVELS', logging]);


    function logging ($logProvider, $provide, DEBUG, LEVELS) {

        var timestampFormat = 'HH:mm:ss:SSS';   // set format (moment.js)
        var useAlias = true;                    // use alias if using ControllerAs
        var padContext = true;                  // use consistent width for context
        var contextWidth = 10;                  // set width of context

        $provide.decorator('$log', ['$delegate', function($delegate) {

            // add support for console.table()
            $delegate.table = function () {

                console.table(arguments);
            };


           // loop through logging functions and add timestamp if debugging and in error logging levels
            angular.forEach($delegate, function(value, key) {

                if (_.contains(LEVELS, key) && DEBUG) {
                    $delegate[key] = formatLog($delegate[key], true, null);
                } else {
                    $delegate[key] = angular.noop;
                }
            });

            // add context if specified
            $delegate.context = function (context) {

                var loggingFuncs = {};

                // loop through logging functions and add context if debugging and in error logging levels
                angular.forEach($delegate, function(num, key){

                    if (_.contains(LEVELS, key) && DEBUG) {
                        loggingFuncs[key] = formatLog($delegate[key], false, context);
                    } else {
                        loggingFuncs[key] = angular.noop;
                    }
                });

                return loggingFuncs;
            };
            return $delegate;
        }]);


        $provide.decorator('$controller', ['$delegate', function($delegate) {

            return function(constructor, locals) {

                if (typeof constructor == 'string') {
                    if (useAlias) {
                        locals.$scope.controllerName = (constructor.indexOf('as ') > -1) ? constructor.split('as ')[1] : constructor;
                    } else {
                        locals.$scope.controllerName = constructor;
                    }
                }
                return $delegate.apply($delegate, arguments);
            }
        }]);


        function formatLog (loggingFunc, timestamp, context) {

            return function () {

                var str = '';

                if (padContext) {
                    str = ('[' + context + ']             ').substr(0, contextWidth);
                } else {
                    str = ('[' + context + '] ');
                }

                if (arguments[0].stack) { // messy - handles ReferenceError messages
                    if (timestamp) {
                        arguments[0].message = moment().format(timestampFormat) + ' ' + arguments[0].message;
                    } else if (context) {
                        arguments[0].message = str + arguments[0].message;
                    }
                } else {
                    if (timestamp) {
                        arguments[0] = moment().format(timestampFormat) + ' ' + arguments[0];
                    } else if (context) {
                        arguments[0] = str + arguments[0];
                    }
                }

                loggingFunc.apply(null, arguments);
            };
        }
    }
})();
