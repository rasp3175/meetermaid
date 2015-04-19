Router.route('/', function () {
    this.render('main');
});

Router.route('/list', function () {
    this.render('list');
});

Router.route('/today', function () {
    this.render('list');
});