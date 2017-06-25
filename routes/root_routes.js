module.exports = function(app, db) {
    app.get('/', function(request, response) {
        response.render('pages/index');
    });
};