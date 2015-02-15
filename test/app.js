
(function(){
    'use strict';

    angular
        .module('app', ['ngLogExt'])
        .controller('MainController', MainController);


    function MainController ($log, $scope) {
        //'log','info','debug','warn','error','table'
        var str = 'message';
        var obj = { foo: 'bar' };
        var arr = ['foo','bar'];
        $log.log('This is a log %', str);
        $log.info('This is an info message + object', obj);
        $log.debug('This is a debug message + array', arr);
        $log.warn('This is a warning');
        $log.error('This is an error');
        $log.table('Table example', arr);

        var log = $log.context('login');
        log.log('This is a log %', str);
        log.info('This is an info message + object', obj);
        log.debug('This is a debug message + array', arr);
        log.warn('This is a warning');
        log.error('This is an error');
        log.table('Table example', arr);

        var log = $log.context($scope.controllerName);
        log.log('This is a log %', str);
        log.info('This is an info message + object', obj);
        log.debug('This is a debug message + array', arr);
        log.warn('This is a warning');
        log.error('This is an error');
        log.table('Table example', arr);
    }
})();
