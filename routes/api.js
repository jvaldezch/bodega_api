const express = require('express');
const moment = require('moment');
const jwt = require('jsonwebtoken');

const multer = require("multer");
const fs = require('fs-extra');
const mime = require('mime');

const qrcode = require('qrcode');
const uuidv4 = require('uuid/v4');

var path  = require('path');
var thumb = require('node-thumbnail').thumb;

moment.updateLocale('en');

var router = express.Router();

var portalModel = require('../models/db');

router.get('/', function (req, res, next) {
    res.render('index', { email: process.env.CONTACT_EMAIL });
});

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

router.post('/login', function (req, res, next) {

    const username = req.body.username;
    const password = req.body.password;

    if (typeof username === 'string' && typeof password === 'string') {

        portalModel.login(username, function (error, result) {

            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    'error': true,
                    'message': error
                });

            } else if (typeof result !== 'undefined') {

                if (result.password.toString('latin1') === password) {

                    var token = jwt.sign({
                        id: result.id,
                        username: username,
                        email: result.email,
                        patente: result.patente,
                        aduana: result.aduana,
                        bodegas: result.bodegas,
                    }, process.env.WSSECRET, {
                            expiresIn: 86400 // expires in 24 hours
                        });

                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.status(200).send({
                        'success': true,
                        'id_user': result.id,
                        'email': result.email,
                        'token': token
                    });

                } else {

                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.status(500).send({
                        'error': true,
                        'message': 'Invalid password.'
                    });

                }
            }
        });

    } else {

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(500).send({
            'error': true,
            'message': 'Username and password are neccesary'
        });

    }

});

router.post('/remember', function (req, res) {

    var token = req.headers['x-access-token'];

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {
        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });
        res.status(200).send(decoded);

    });
});

router.post('/bodegas', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_user = req.body.id_user;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.bodegas(id_user, function (error, results) {
            if (error) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });
            } else if (typeof results !== 'undefined' && results.length > 0) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });
            }
        });

    });

});

router.post('/descargas', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_bodega = req.body.id_bodega;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_bodega) return res.status(401).send({
        error: true,
        message: 'ID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.traficosDescarga(id_bodega, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else if (typeof results !== 'undefined' && results.length > 0) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });
    });

});

router.post('/cargas', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_bodega = req.body.id_bodega;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_bodega) return res.status(401).send({
        error: true,
        message: 'ID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.traficosCarga(id_bodega, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else if (typeof results !== 'undefined' && results.length > 0) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });
    });

});


router.post('/ordenes', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_bodega = req.body.id_bodega;
    const fecha = req.body.fecha;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!fecha) return res.status(401).send({
        error: true,
        message: 'Date is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.traficosOrdenes(id_bodega, fecha, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else if (typeof results !== 'undefined' && results.length > 0) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });
    });

});

router.post('/detalle-trafico', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.detalleTrafico(id_trafico, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else if (typeof results !== 'undefined' && results.length > 0) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});

router.post('/discrepancias', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.discrepancias(id_trafico, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else if (typeof results !== 'undefined' && results.length > 0) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});

router.post('/comentarios', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.comentarios(id_trafico, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else if (typeof results !== 'undefined' && results.length > 0) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});

router.post('/agregar-comentario', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;
    const id_user = req.body.id_user;
    const message = req.body.message;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is required.'
    });

    if (!message) return res.status(401).send({
        error: true,
        message: 'Message is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.agregarComentario(id_trafico, id_user, message, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});

router.post('/agregar-discrepancia', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;
    const id_user = req.body.id_user;
    const message = req.body.message;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is required.'
    });

    if (!message) return res.status(401).send({
        error: true,
        message: 'Message is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.agregarDiscrepancia(id_trafico, id_user, message, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});

router.post('/referencia-descarga', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;
    const id_user = req.body.id_user;
    const unload_date = req.body.unload_date;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is required.'
    });

    if (!unload_date) return res.status(401).send({
        error: true,
        message: 'Unload date is required.'
    });

    if (!moment(unload_date, 'YYYY-MM-DD HH:mm:ss', true).isValid()) return res.status(401).send({
        error: true,
        message: 'Unload date is not in valid format (YYYY-MM-DD HH:mm:ss).'
    });


    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.referenciaDescarga(id_trafico, id_user, unload_date, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});

router.post('/referencia-carga', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;
    const id_user = req.body.id_user;
    const load_date = req.body.load_date;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is required.'
    });

    if (!load_date) return res.status(401).send({
        error: true,
        message: 'Load date is required.'
    });

    if (!moment(load_date, 'YYYY-MM-DD HH:mm:ss', true).isValid()) return res.status(401).send({
        error: true,
        message: 'Load date is not .'
    });


    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.referenciaCarga(id_trafico, id_user, load_date, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});


router.post('/obtener-bultos', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.obtenerBultos(id_trafico, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});

router.post('/agregar-bulto', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_bodega = req.body.id_bodega;
    const id_trafico = req.body.id_trafico;
    const id_user = req.body.id_user;
    const dano = req.body.dano;
    const observacion = req.body.observacion;
    const uuid = req.body.uuid;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_bodega) return res.status(401).send({
        error: true,
        message: 'Warehouse ID is required.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is required.'
    });

    if (!uuid) return res.status(401).send({
        error: true,
        message: 'UUID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.agregarBulto(id_bodega, id_trafico, id_user, dano, observacion, uuid, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});

router.post('/actualizar-bulto', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_bulto = req.body.id_bulto;
    const dano = req.body.dano;
    const observacion = req.body.observacion;
    const uuid = req.body.uuid;
    const unload_date = req.body.unload_date;
    const load_date = req.body.load_date;
    const revision_date = req.body.revision_date;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_bulto) return res.status(401).send({
        error: true,
        message: 'Package ID is required.'
    });

    if (!moment(unload_date, 'YYYY-MM-DD HH:mm:ss', true).isValid()) return res.status(401).send({
        error: true,
        message: 'Unload date is not in valid format (YYYY-MM-DD HH:mm:ss).'
    });

    if (!moment(load_date, 'YYYY-MM-DD HH:mm:ss', true).isValid()) return res.status(401).send({
        error: true,
        message: 'Load date is not in valid format (YYYY-MM-DD HH:mm:ss).'
    });

    if (!moment(revision_date, 'YYYY-MM-DD HH:mm:ss', true).isValid()) return res.status(401).send({
        error: true,
        message: 'Revision date is not in valid format (YYYY-MM-DD HH:mm:ss).'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.actualizarBulto(id_bulto, dano, observacion, uuid, unload_date, load_date, revision_date, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });

            }
        });

    });

});

const upload = multer({dest: process.env.DIR_EXPEDIENTES});

router.post('/subir-imagen', upload.single('img_bulto'), function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;
    const id_bulto = req.body.id_bulto;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    if (!id_bulto) return res.status(401).send({
        error: true,
        message: 'Package ID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        if(req.file) {

            portalModel.detalleTrafico(id_trafico, function (error, results) {
                if (error) {

                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.status(500).send({
                        "error": true,
                        'message': error
                    });

                } else if (typeof results !== 'undefined' && results.length > 0) {

                    eta_date = moment(results[0].fecha_eta);

                    var filename_out = req.file.destination + path.sep + results[0].siglas + path.sep + eta_date.format("Y") + path.sep + eta_date.format("MM") + 
                        path.sep + eta_date.format("DD") + path.sep + results[0].referencia + path.sep + req.file.originalname;

                    if (!fs.existsSync(filename_out)) {

                        fs.move(req.file.path, filename_out, function (err) {

                            carpeta = path.dirname(filename_out);
                            imagen = path.basename(filename_out);
                            miniatura = null;
                            id_status = 1;

                            filename_thumb = filename_out.replace(/(\.[\w\d_-]+)$/i, '_thumb$1');
                            miniatura = path.basename(filename_thumb);

                            thumb({
                                source: filename_out, 
                                destination: path.dirname(filename_out),
                                width: 340,
                                suffix: '_thumb',
                            }, function(files, err, stdout, stderr) {
                            });

                            portalModel.agregarImagen(id_trafico, id_bulto, id_status, carpeta, imagen, miniatura, function (error, results) {
                                if (error) {

                                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                                    res.status(500).send({
                                        "error": true,
                                        'message': error
                                    });
                    
                                } else {
                    
                                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                                    res.status(200).send({
                                        success: true,
                                        results: results
                                    });
                    
                                }
                            });

                        });

                    } else {
                        //fs.unlinkSync(req.file.path);

                        carpeta = path.dirname(filename_out);
                        imagen = path.basename(filename_out);

                        portalModel.comprobarImagen(id_trafico, imagen, function (error, results) {
                            if (error) {

                                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                                res.status(500).send({
                                    "error": true,
                                    'message': error
                                });
                
                            } else {
                
                                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                                res.status(200).send({
                                    success: true,
                                    results: {
                                        "id_imagen" : results[0].id_imagen
                                    }
                                });
                
                            }
                        });

                    }

                }
            });

        } else {
            return res.status(401).send({
                error: true,
                message: 'Image is necessary.'
            });
        }
    });

});

router.post('/borrar-imagen', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;
    const id_imagen = req.body.id_imagen;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    if (!id_imagen) return res.status(401).send({
        error: true,
        message: 'Imagen number is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.buscarImagen(id_trafico, id_imagen, function (error, results) {
            if (error) {

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });

            } else {

                filename_img = results.carpeta + path.sep + results.imagen;
                filename_tmb = results.carpeta + path.sep + results.miniatura;

                portalModel.borrarImagen(id_trafico, id_imagen, function (error, results) {
                    if (error) {
            
                        res.setHeader('Content-Type', 'application/json; charset=utf-8');
                        res.status(500).send({
                            "error": true,
                            'message': error
                        });
            
                    } else {

                        fs.unlinkSync(filename_img);
                        fs.unlinkSync(filename_tmb);

                        res.setHeader('Content-Type', 'application/json; charset=utf-8');
                        res.status(200).send({
                            success: true,
                            results: results
                        });

                    }
                });

            }
        });

    });

});

router.post('/obtener-imagenes', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_trafico = req.body.id_trafico;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is necessary.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.obtenerImagenes(id_trafico, function (error, results) {
            if (error) {
    
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });
    
            } else {
    
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });
    
            }
        });

    });

});

router.post('/obtener-imagen', function (req, res) {

    const token = req.headers['x-access-token'];
    const id_imagen = req.body.id_imagen;
    const id_trafico = req.body.id_trafico;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_imagen) return res.status(401).send({
        error: true,
        message: 'Image ID is required.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.obtenerImagen(id_imagen, id_trafico, function (error, results) {
            if (error) {
    
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });
    
            } else {

                filename_out = results[0].carpeta + path.sep + results[0].imagen;
                if (fs.existsSync(filename_out)) {

                    var base64str = base64_encode(filename_out);
                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.status(200).send({
                        success: true,
                        results: {
                            'image' : base64str
                        }
                    });

                } else {

                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.status(500).send({
                        "error": true,
                        'message': 'Image file not found!'
                    });

                }
    
            }
        });

    });

});

router.get('/imprimir-qr', function (req, res) {
    
    var arr = {
        'uuid': uuidv4(),
        'id_trafico': 345523,
        'referencia': '18E-888347',
        'rfc_cliente': 'JMM931208JY9',
        'id_bulto': 1,
        'bulto': 1
    }

    qrcode.toDataURL(JSON.stringify(arr), function (err, url) {

        console.log(arr);

        res.render('imprimir-qr', { qr: url });

      });
});

router.post('/buscar-uuid', function (req, res) {
    
    const token = req.headers['x-access-token'];
    const uuid = req.body.uuid;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!uuid) return res.status(401).send({
        error: true,
        message: 'UUID is required.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.buscarQr(uuid, function (error, results) {
            if (error) {
    
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(500).send({
                    "error": true,
                    'message': error
                });
    
            } else {
    
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send({
                    success: true,
                    results: results
                });
    
            }
        });

    });


});

function sendErrHandler(res, err) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).send({
        success: false,
        message: err
    });
    return true;
}

function sendEmptyResponse(res, message = "") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).send({
        success: false,
        response: [],
        message: message
    });
    return true;
}

function sendSuccessResponse(res, response) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).send({
        success: true,
        response: response
    });
    return true;
}

router.get('/qr-reader', function (req, res) {
    var QrCode = require('qrcode-reader');
    var Jimp = require("jimp");
    var buffer = fs.readFileSync('D:\\Temp\\20190829_182013.png');
    Jimp.read(buffer, function(err, image) {
        if (err) {
            return sendErrHandler(res, err);
        }
        var qr = new QrCode();
        qr.callback = function(err, value) {
            if (err) {
                return sendErrHandler(res, err);
            }
            if (value) {
                console.log(value.result);
                var correctJson = value.result.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
                return sendSuccessResponse(res, JSON.parse(correctJson));
            } else {
                return sendEmptyResponse(res, "Not a valid QR");
            }
        };
        qr.decode(image.bitmap);

    });

});

module.exports = router;