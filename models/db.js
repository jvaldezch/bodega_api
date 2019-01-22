
var mysql = require('mysql');

const moment = require('moment');

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

        if (err) callback({ status: 'error', message: err}, null);

        var sql = "SELECT id, email, aduana, patente, " +
            "AES_DECRYPT(password, '" + process.env.DBSECRET   + "') AS password " +
            "FROM usuarios WHERE usuario = " + db.escape(username) + ";";

        connection.query(sql, function (error, results, fields) {

            if (err) callback({ status: 'error', message: err}, null);
            
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

        });
    });
    
}

portalModel.traficosDescarga = function (id_bodega, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

        var sql = "SELECT " +
            "t.id AS id_trafico, " +
            "t.rfcCliente AS rfc_cliente, " +
            "c.nombre AS nombre_cliente, " +
            "t.referencia, " +
            "t.bultos, " +
            "t.contenedorCajaEntrada AS caja_entrada " +
            "FROM traficos t " +
            "LEFT JOIN trafico_clientes c ON c.id = t.idCliente " +
            "WHERE t.idBodega = " + db.escape(id_bodega) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({
                    status: 'No data found',
                    message: false
                }, null);
            }

        });

    });

}

portalModel.traficosOrdenes = function (id_bodega, fecha, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

        var sql = "SELECT " +
            "t.id AS id_trafico, " +
            "t.rfcCliente AS rfc_cliente, " +
            "c.nombre AS nombre_cliente, " +
            "t.referencia, " +
            "t.bultos, " +
            "t.contenedorCajaEntrada AS caja_entrada, " +
            "t.ordenCarga AS orden_carga " +
            "FROM traficos t " +
            "LEFT JOIN trafico_clientes c ON c.id = t.idCliente " +
            "WHERE t.ordenCarga IS NOT NULL t.idBodega = " + db.escape(id_bodega) + "AND t.fechaEta = " + db.escape(fecha) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({
                    status: 'No data found',
                    message: false
                }, null);
            }

        });

    });

}

portalModel.bodegas = function (id_user, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

        var sql = "SELECT " +
            "id AS id_bodega " +
            "FROM trafico_usubodegas " +
            "WHERE idUsuario = " + id_user + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({
                    status: 'No data found',
                    message: 'User not found on database.'
                }, null);
            }

        });

    });
    
}

portalModel.detalleTrafico = function (id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

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
            "t.contenedorCaja as caja, " +
            "t.lineaTransporte as linea_transporte, " +
            "t.fechaDescarga as fecha_descarga, " +
            "t.fechaCarga as fecha_carga " +
            "FROM traficos t " +
            "LEFT JOIN trafico_clientes c ON c.id = t.idCliente " +
            "WHERE t.id = " + db.escape(id_trafico) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            
            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({
                    status: 'No data found',
                    message: 'User not found on database.'
                }, null);
            }

        });
    
    });

}

portalModel.comentarios = function (id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

        var sql = "SELECT " +
            "c.id, " +
            "u.nombre, " +
            "c.mensaje " +
            "FROM trafico_comentarios AS c " +
            "LEFT JOIN usuarios AS u ON u.id = c.idUsuario " +
            "WHERE c.idTrafico = " + db.escape(id_trafico) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({status: 'No data found', message: 'Reference ID does not have comments.'}, null);
            }

        });
    
    });

}

portalModel.discrepancias = function (id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

        var sql = "SELECT " +
            "c.id, " +
            "u.nombre, " +
            "c.mensaje " +
            "FROM trafico_discrepancias AS c " +
            "LEFT JOIN usuarios AS u ON u.id = c.idUsuario " +
            "WHERE c.idTrafico = " + db.escape(id_trafico) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({status: 'No data found', message: 'Reference ID does not have comments.'}, null);
            }

        });
    
    });

}

portalModel.agregarComentario = function (id_trafico, id_user, message, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

        connection.query('INSERT INTO trafico_comentarios SET ?', {idTrafico: id_trafico, idUsuario: id_user, mensaje: message, creado: moment().format('YYYY-MM-DD HH:mm:ss')}, function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            if (results.insertId) {
                callback(null, {'id_comment': results.insertId});
            }

        });
    
    });

}

portalModel.agregarDiscrepancia = function (id_trafico, id_user, message, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

        connection.query('INSERT INTO trafico_discrepancias SET ?', {idTrafico: id_trafico, idUsuario: id_user, mensaje: message, creado: moment().format('YYYY-MM-DD HH:mm:ss')}, function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            if (results.insertId) {
                callback(null, {'id_comment': results.insertId});
            }

        });
    
    });

}

portalModel.referenciaDescarga = function (id_trafico, id_user, unload_date, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

        connection.query('UPDATE traficos SET fechaDescarga = ? WHERE id = ?', [unload_date, id_trafico], function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            callback(null, {'updated': true});

        });
    
    });

}

portalModel.referenciaCarga = function (id_trafico, id_user, load_date, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ status: 'error', message: err}, null);

        connection.query('UPDATE traficos SET fechaCarga = ? WHERE id = ?', [load_date, id_trafico], function (error, results, fields) {
            connection.release();
            if (err) callback({ status: 'error', message: err}, null);

            callback(null, {'updated': true});

        });
    
    });

}

module.exports = portalModel;