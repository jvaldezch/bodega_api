
const mysql = require('mysql');

const moment = require('moment');

const db_params = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 500
};

const db = mysql.createPool(db_params);

const portalModel = {};

portalModel.login = function (username, callback) {

    let user;

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT id, email, aduana, patente, " +
            "AES_DECRYPT(password, '" + process.env.DBSECRET + "') AS password " +
            "FROM usuarios WHERE usuario = " + db.escape(username) + ";";

        connection.query(sql, function (error, results, fields) {

            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {

                user = results[0];
                user.bodegas = [];

                let sql2 = "SELECT * FROM trafico_usubodegas WHERE idUsuario = " + user.id + ";"
                connection.query(sql2, function (err, rows, fields) {
                    connection.release();

                    if (err) callback({ error: true, message: error }, null);

                    if (rows.length > 0) {
                        for (let i = 0, len = rows.length; i < len; i++) {
                            user.bodegas[i] = rows[i].idBodega;
                        }
                    }
                    callback(null, user);

                });

            } else {
                connection.release();
                callback(null, {
                    error: true,
                    message: 'User was not found on database.'
                });
            }

        });
    });

};

portalModel.traficosDescarga = function (id_bodega, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
            "t.id AS id_trafico, " +
            "t.rfcCliente AS rfc_cliente, " +
            "c.nombre AS nombre_cliente, " +
            "t.referencia, " +
            "t.pedimento, " +
            "t.bultos, " +
            "t.ubicacion, " +
            "t.proveedores AS proveedor, " +
            "t.blGuia AS bl_guia, " +
            "t.pesoKg AS peso_kg, " +
            "t.contenedorCajaEntrada AS caja_entrada " +
            "FROM traficos t " +
            "LEFT JOIN trafico_clientes c ON c.id = t.idCliente " +
            "WHERE t.idBodega = " + db.escape(id_bodega) + " AND t.contenedorCajaEntrada IS NOT NULL AND estatus NOT IN (3, 4);";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback(null, {
                    error: true,
                    message: "No references found to unload."
                });
            }

        });

    });

};

portalModel.traficosCarga = function (id_bodega, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
            "t.id AS id_trafico, " +
            "t.rfcCliente AS rfc_cliente, " +
            "c.nombre AS nombre_cliente, " +
            "t.referencia, " +
            "t.pedimento, " +
            "t.bultos, " +
            "t.ubicacion, " +
            "t.proveedores AS proveedor, " +
            "t.blGuia AS bl_guia, " +
            "t.pesoKg AS peso_kg, " +
            "t.ordenCarga AS orden_salida, " +
            "t.contenedorCajaSalida AS caja_salida " +
            "FROM traficos t " +
            "LEFT JOIN trafico_clientes c ON c.id = t.idCliente " +
            "WHERE t.idBodega = " + db.escape(id_bodega) + " AND (t.ordenCarga IS NOT NULL AND t.fechaRevision IS NOT NULL AND t.fechaCarga IS NULL) AND estatus NOT IN (3, 4);";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback(null, {
                    error: true,
                    message: "No references found to load."
                });
            }

        });

    });

};

portalModel.traficosRevision = function (id_bodega, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
            "t.id AS id_trafico, " +
            "t.rfcCliente AS rfc_cliente, " +
            "c.nombre AS nombre_cliente, " +
            "t.referencia, " +
            "t.pedimento, " +
            "t.bultos, " +
            "t.ubicacion, " +
            "t.proveedores AS proveedor, " +
            "t.blGuia AS bl_guia, " +
            "t.pesoKg AS peso_kg, " +
            "t.ordenCarga AS orden_salida, " +
            "t.contenedorCajaSalida AS caja_salida " +
            "FROM traficos t " +
            "LEFT JOIN trafico_clientes c ON c.id = t.idCliente " +
            "WHERE t.idBodega = " + db.escape(id_bodega) + 
            " AND (fechaDescarga IS NOT NULL AND fechaRevision IS NULL) AND estatus NOT IN (3, 4);";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback(null, {
                    error: true,
                    message: "No references found for revision."
                });
            }

        });

    });

};

portalModel.traficosSalida = function (id_bodega, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
            "t.id AS id_trafico, " +
            "t.rfcCliente AS rfc_cliente, " +
            "c.nombre AS nombre_cliente, " +
            "t.referencia, " +
            "t.bultos, " +
            "t.ubicacion, " +
            "t.proveedores AS proveedor, " +
            "t.blGuia AS bl_guia, " +
            "t.pesoKg AS peso_kg, " +
            "t.ordenCarga AS orden_salida, " +
            "t.contenedorCajaSalida AS caja_salida " +
            "FROM traficos t " +
            "LEFT JOIN trafico_clientes c ON c.id = t.idCliente " +
            "WHERE t.idBodega = " + db.escape(id_bodega) + 
            " AND (t.fechaCarga IS NOT NULL AND t.fechaRevision IS NOT NULL AND t.ordenCarga IS NOT NULL) AND estatus NOT IN (3, 4);";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback(null, {
                    error: true,
                    message: "No references found to load."
                });
            }

        });

    });

};

portalModel.traficosOrdenes = function (id_bodega, fecha, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
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
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({
                    error: true,
                    message: "No new orders found."
                }, null);
            }

        });

    });

};

portalModel.bodegas = function (id_user, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
            "idBodega AS id_bodega " +
            "FROM trafico_usubodegas " +
            "WHERE idUsuario = " + id_user + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback(null, {
                    error: true,
                    message: 'User has no warehouses assigned.'
                });
            }

        });

    });

};

portalModel.detalleTrafico = function (id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
            "t.idBodega as id_bodega," +
            "t.idCliente as id_cliente, " +
            "t.referencia, " +
            "t.pedimento AS pedimento, " +
            "t.rfcCliente AS rfc_cliente, " +
            "c.nombre as nombre_cliente, " +
            "t.bultos, " +
            "t.ordenCarga AS orden_carga, " +
            "t.blGuia as bl_guia, " +
            "t.contenedorCajaEntrada AS caja_entrada, " +
            "t.contenedorCaja as caja, " +
            "t.lineaTransporte as linea_transporte, " +
            "t.ubicacion as ubicacion, " +
            "t.pesoKg as peso_kg, " +
            "t.proveedores as proveedores, " +
            "t.fechaSalida as fecha_salida, " +
            "t.fechaRevision as fecha_revision, " +
            "t.fechaDescarga as fecha_descarga, " +
            "t.fechaCarga as fecha_carga, " +
            "t.fechaEta as fecha_eta, " +
            "b.siglas, " +
            "u.email " +
            "FROM traficos t " +
            "LEFT JOIN trafico_clientes c ON c.id = t.idCliente " +
            "LEFT JOIN trafico_bodegas b ON t.idBodega = b.id " +
            "LEFT JOIN usuarios u ON u.id = t.idUsuario " +
            "WHERE t.id = " + db.escape(id_trafico) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (error) 
                callback({ error: true, message: error }, null);
            if (results.length > 0) {
                callback(null, results);
            } else {
                callback(null, {
                    error: true,
                    message: 'Reference was not found on database.'
                });
            }

        });

    });

};

portalModel.comentarios = function (id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
            "c.id, " +
            "u.nombre, " +
            "c.mensaje " +
            "FROM trafico_comentarios AS c " +
            "LEFT JOIN usuarios AS u ON u.id = c.idUsuario " +
            "WHERE c.idTrafico = " + db.escape(id_trafico) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback(null, {
                    error: true,
                    message: 'Reference ID does not have comments.'
                });
            }

        });

    });

};

portalModel.discrepancias = function (id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
            "c.id, " +
            "u.nombre, " +
            "c.mensaje " +
            "FROM trafico_discrepancias AS c " +
            "LEFT JOIN usuarios AS u ON u.id = c.idUsuario " +
            "WHERE c.idTrafico = " + db.escape(id_trafico) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback(null, { 
                    error: true, 
                    message: 'Reference ID does not have inconsistencies.' 
                });
            }

        });

    });

};

portalModel.agregarComentario = function (id_trafico, id_user, message, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        connection.query('INSERT INTO trafico_comentarios SET ?', { idTrafico: id_trafico, idUsuario: id_user, mensaje: message, creado: moment().format('YYYY-MM-DD HH:mm:ss') }, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.insertId) {
                callback(null, { 'id_comment': results.insertId });
            }

        });

    });

};

portalModel.emailUsuario = async function (id_user, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT u.email FROM usuarios AS u WHERE u.id = " + db.escape(id_user) + " LIMIT 1;";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            }

        });

    });

};

portalModel.agregarDiscrepancia = function (id_trafico, id_user, message, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        connection.query('INSERT INTO trafico_discrepancias SET ?', { idTrafico: id_trafico, idUsuario: id_user, mensaje: message, creado: moment().format('YYYY-MM-DD HH:mm:ss') }, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.insertId) {
                callback(null, { 'id_comment': results.insertId });
            }

        });

    });

};

portalModel.referenciaDescarga = function (id_trafico, id_user, unload_date, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        connection.query('UPDATE traficos SET fechaDescarga = ? WHERE id = ?', [unload_date, id_trafico], function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            callback(null, { 'updated': true });

        });

    });

};

portalModel.referenciaRevision = function (id_trafico, id_user, revision_date, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        connection.query('UPDATE traficos SET fechaRevision = ? WHERE id = ?', [revision_date, id_trafico], function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            callback(null, { 'updated': true });

        });

    });

};

portalModel.referenciaCarga = function (id_trafico, id_user, load_date, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        connection.query('UPDATE traficos SET fechaCarga = ? WHERE id = ?', [load_date, id_trafico], function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            callback(null, { 'updated': true });

        });

    });

};

portalModel.referenciaSalida = function (id_trafico, id_user, dispatch_date, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        connection.query('UPDATE traficos SET fechaSalida = ? WHERE id = ?', [dispatch_date, id_trafico], function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            callback(null, { 'updated': true });

        });

    });

};

portalModel.obtenerBultos = function (id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT " +
            "b.id AS id_bulto, " +
            "u.nombre, " +
            "b.dano, " +
            "b.uuid, " +
            "b.observacion, " +
            "b.mercancia, " +
            "b.uuid, " +
            "b.qr, " +
            "DATE_FORMAT(b.descarga, '%Y-%m-%d %H:%i:%s') AS unload_date, " +
            "DATE_FORMAT(b.carga, '%Y-%m-%d %H:%i:%s') AS load_date, " +
            "DATE_FORMAT(b.revision, '%Y-%m-%d %H:%i:%s') AS revision_date " +
            "FROM trafico_bultos AS b " +
            "LEFT JOIN usuarios AS u ON u.id = b.idUsuario " +
            "WHERE b.idTrafico = " + db.escape(id_trafico) + " AND b.uuid IS NOT NULL;";

        connection.query(sql, function (error, results) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback(null, {
                    error: true,
                    message: 'Reference ID does not have packages.'
                });
            }
        });

    });

};

portalModel.agregarBulto = function (id_bodega, id_trafico, id_user, dano, observacion, uuid, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        connection.query('INSERT INTO trafico_bultos SET ?',
            {
                idBodega: id_bodega,
                idTrafico: id_trafico,
                idUsuario: id_user,
                observacion: observacion,
                dano: dano,
                uuid: uuid,
                escaneado: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            function (error, results, fields) {
                connection.release();
                if (err) callback({ error: true, message: err }, null);

                if (results.insertId) {
                    callback(null, { 'id_bulto': results.insertId });
                }

            });

    });

};

portalModel.agregarImagen = function (id_trafico, id_bulto, id_status, carpeta, imagen, miniatura, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        connection.query('INSERT INTO trafico_imagenes SET ?',
            {
                idTrafico: id_trafico,
                idBulto: id_bulto,
                idEstatus: id_status,
                carpeta: carpeta,
                imagen: imagen,
                miniatura: miniatura,
                nombre: imagen,
                creado: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            function (error, results, fields) {
                connection.release();
                if (error) 
                    callback({ error: true, message: error }, null);
                if (results.insertId) {
                    callback(null, { 'id_imagen': results.insertId });
                }
            });

    });

};

portalModel.comprobarImagen = function (id_trafico, nombre, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT id AS id_image FROM trafico_imagenes WHERE idTrafico = " + id_trafico + " AND nombre = " + db.escape(nombre) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (error) callback({ error: true, message: error }, null);

            if (results.length > 0) {
                callback(null, results[0]);
            } else {
                callback({ status: 'No data found', message: 'No image found.' }, null);
            }
        });
    });
};

portalModel.buscarImagen = function (id_trafico, id_imagen, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT * FROM trafico_imagenes WHERE idTrafico = " + id_trafico + " AND id = " + db.escape(id_imagen) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results[0]);
            } else {
                callback({ status: 'No data found', message: 'Image ID is not found.' }, null);
            }
        });
    });
};

portalModel.borrarImagen = function (id_trafico, id_imagen, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "DELETE FROM trafico_imagenes WHERE idTrafico = " + id_trafico + " AND id = " + db.escape(id_imagen) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            callback(null, {message: 'Image deleted.' });

        });

    });

};

portalModel.obtenerImagenes = function (id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT id AS id_imagen FROM trafico_imagenes WHERE idTrafico = " + db.escape(id_trafico) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({ status: 'No data found', message: 'Reference ID does not have images.' }, null);
            }

        });

    });

};

portalModel.obtenerImagen = function (id_imagen, id_trafico, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT carpeta, imagen FROM trafico_imagenes WHERE id = " + db.escape(id_imagen) + " AND idTrafico = " + db.escape(id_trafico) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({ status: 'No data found', message: 'Reference ID does not have packages.' }, null);
            }

        });

    });

};

portalModel.actualizarBulto = function (id_bulto, dano, observacion, uuid, descarga, carga, revision, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        connection.query('UPDATE trafico_bultos SET dano = ?, observacion = ?, qr = ?, carga = ?, descarga = ?, revision = ?, actualizado = ? WHERE id = ?', 
        [dano, observacion, uuid, descarga, carga, revision, moment().format('YYYY-MM-DD HH:mm:ss'), id_bulto], function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            callback(null, { 'updated': true });

        });

    });

};

portalModel.actualizarBultoDescarga = function (id_bulto, dano, observacion, descarga, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let actualizado = moment().format('YYYY-MM-DD HH:mm:ss');
        let sql = "UPDATE trafico_bultos SET dano = " + dano + ", observacion = '" + observacion + "', descarga = '" + descarga + "', actualizado = '" + actualizado + "' WHERE id = " + id_bulto +";";

        connection.query(sql, function (errs, results, fields) {
            connection.release();
            if (errs) {
                callback({ error: true, message: err }, null);
            }
            if (results.affectedRows > 0) {
                callback(null, { 'updated': true });
            } else {
                callback(null, { 'updated': false, 'message': results.affectedRows + " record(s) updated" });
            }

        });

    });

};

portalModel.actualizarBultoCarga = function (id_bulto, dano, observacion, carga, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let actualizado = moment().format('YYYY-MM-DD HH:mm:ss');
        let sql = "UPDATE trafico_bultos SET dano = " + dano + ", observacion = '" + observacion + "', carga = '" + carga + "', actualizado = '" + actualizado + "' WHERE id = " + id_bulto +";";

        connection.query(sql, function (errs, results, fields) {
            connection.release();
            if (errs) {
                callback({ error: true, message: err }, null);
            }
            if (results.affectedRows > 0) {
                callback(null, { 'updated': true });
            } else {
                callback(null, { 'updated': false, 'message': results.affectedRows + " record(s) updated" });
            }

        });

    });

};

portalModel.actualizarBultoRevision = function (id_bulto, dano, observacion, revision, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let actualizado = moment().format('YYYY-MM-DD HH:mm:ss');
        let sql = "UPDATE trafico_bultos SET dano = " + dano + ", observacion = '" + observacion + "', revision = '" + revision + "', actualizado = '" + actualizado + "' WHERE id = " + id_bulto +";";

        connection.query(sql, function (errs, results, fields) {
            connection.release();
            if (errs) {
                callback({ error: true, message: err }, null);
            }
            if (results.affectedRows > 0) {
                callback(null, { 'updated': true });
            } else {
                callback(null, { 'updated': false, 'message': results.affectedRows + " record(s) updated" });
            }

        });

    });

};

portalModel.buscarQr = function (uuid, callback) {

    db.getConnection(function (err, connection) {

        if (err) callback({ error: true, message: err }, null);

        let sql = "SELECT id AS id_bulto, escaneado FROM trafico_bultos WHERE uuid = " + db.escape(uuid) + ";";

        connection.query(sql, function (error, results, fields) {
            connection.release();
            if (err) callback({ error: true, message: err }, null);

            if (results.length > 0) {
                if (results[0].escaneado == null) {
                    results[0].escaneado = false;
                } else {
                    results[0].escaneado = true;
                }
                callback(null, results);
            } else {
                callback({ status: 'No data found', message: 'UUID not found.' }, null);
            }

        });

    });

};

module.exports = portalModel;