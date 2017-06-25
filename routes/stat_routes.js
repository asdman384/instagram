const fs = require('fs');
const exec = require('child_process').exec;
module.exports = function(app, db) {
    app.get('/stats', (req, res) => {
        db.connection.query(`
            SELECT 
                COUNT(id) as count, 
                strftime('%Y %m %d %H %M', datetime / 1000 + :time_shift, 'unixepoch') AS date
                FROM users 
                WHERE datetime > :days_back
                GROUP BY date ORDER BY date ASC
            `, {
            replacements: {
                time_shift: 60 * 60 * 3, // 3 hours
                days_back: Math.ceil(new Date() - 60 * 1000 * 60 * 24 * 2) // 2 days back
            },
            type: db.connection.QueryTypes.SELECT,
            raw: true
        }).then(stats => {
            exec('ps -auxf | grep node', (err, stdout, stdin) => {
                res.render('pages/stats', {
                    data: stats,
                    process_data: err || stdout
                });
            });
        });
    });
    app.get('/logs', (req, res) => {
        const logFile = './screenlog.0'
        fs.access(logFile, fs.constants.R_OK, (err) => {
            var response = 'no access to ' + logFile;
            if (!err) {
                fs.readFile(logFile, 'utf8', (err, data) => {
                    res.send(err || `<textarea style="
                                        margin: 0px;
                                        height: 1400px;
                                        width: 1000px;
                                        font-size: 4px;
                                    ">${data}</textarea>`);
                });
                return;
            }
            res.send(response);
        });
    });
    app.get('/ps', (req, res) => {
        exec('ps -auxf | grep node', (err, stdout, stdin) => {
            res.send(err || `<textarea style="
                                margin: 0px;    
                                height: 1400px;
                                width: 1000px;
                                font-size: 4;
                            ">${stdout}</textarea>`);
        });
    });
    app.post('/stats', (req, res) => {
        res.send(req.body);
    });
};