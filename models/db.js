
var mysql = require('mysql');

var db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 500
});

const portalModel = {};

portalModel.login = function (username, callback) {

    var user;

    db.getConnection(function (err, connection) {

        if (err) {
            callback({
                status: 'error',
                message: err
            }, null);
        }

        var sql = "SELECT id, email, aduana, patente, " +
            "AES_DECRYPT(password, '" + process.env.DBSECRET   + "') AS password " +
            "FROM usuarios WHERE usuario = " + db.escape(username) + ";";

        connection.query(sql, function (error, results, fields) {

            if (error) {
                connection.release();
                callback({
                    status: 'error',
                    message: error
                }, null);

            } else {

                if (results.length > 0) {

                    user = results[0];
                    user.bodegas = []

                    var sql2 = "SELECT * FROM trafico_usubodegas WHERE idUsuario = " + user.id + ";"
                    connection.query(sql2, function (err, rows, fields) {
                        connection.release();

                        if (err) callback({status: 'error',message: error}, null);
                        
                        if (rows.length > 0) {
                            for (var i = 0, len = rows.length; i < len; i++) {                
                                user.bodegas[i] = rows[i].idBodega;
                            }
                        }
                        callback(null, user);

                    });

                } else {
                    connection.release();
                    callback({
                        status: 'No data found',
                        message: 'User not found on database.'
                    }, null);
                }

            }
        });
    });
    
}

portalModel.traficosDescarga = function (id_bodega, fecha, callback) {

    db.getConnection(function (err, connection) {

        if (err) {
            callback({
                status: 'error',
                message: err
            }, null);
        }

        var sql = "SELECT " +
            "id, " +
            "referencia, " +
            "bultos, " +
            "contenedorCajaEntrada AS caja_entrada " +
            "FROM traficos " +
            "WHERE idBodega = " + db.escape(id_bodega) + "AND fechaEta = " + db.escape(fecha) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (error) {
                callback({
                    status: 'error',
                    message: error
                }, null);

            } else {
                if (results.length > 0) {
                    callback(null, results);
                } else {
                    callback({
                        status: 'No data found',
                        message: false
                    }, null);
                }
            }
        });

    });

}

portalModel.bodegas = function (id_user, callback) {

    db.getConnection(function (err, connection) {

        if (err) {
            callback({
                status: 'error',
                message: err
            }, null);
        }

        var sql = "SELECT " +
            "* " +
            "FROM trafico_usubodegas " +
            "WHERE idUsuario = " + id_user + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (error) {
                callback({
                    status: 'error',
                    message: error
                }, null);

            } else {
                if (results.length > 0) {
                    callback(null, results);
                } else {
                    callback({
                        status: 'No data found',
                        message: 'User not found on database.'
                    }, null);
                }
            }
        });

    });
    
}

portalModel.detalleTrafico = function (id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) {
            callback({
                status: 'error',
                message: err
            }, null);
        }

        var sql = "SELECT " +
            "t.idBodega as id_bodega," +
            "t.idCliente as id_cliente, " +
            "t.referencia, " +
            "t.rfcCliente AS rfc_cliente, " +
            "c.nombre as nombre_cliente, " +
            "t.bultos, " +
            "t.ordenCarga AS orden_carga, " +
            "t.blGuia as bl_guia, " +
            "t.contenedorCajaEntrada AS caja_entrada, " +
            "t.contenedorCaja as caja, t.lineaTransporte as linea_transporte " +
            "FROM traficos t " +
            "LEFT JOIN trafico_clientes c ON c.id = t.idCliente " +
            "WHERE t.id = " + db.escape(id_trafico) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (error) {
                callback({
                    status: 'error',
                    message: error
                }, null);

            } else {
                if (results.length > 0) {
                    callback(null, results);
                } else {
                    callback({
                        status: 'No data found',
                        message: 'User not found on database.'
                    }, null);
                }
            }
        });
    
    });

}

module.exports = portalModel;