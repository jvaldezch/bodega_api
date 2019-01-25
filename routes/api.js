const express = require('express');
const moment = require('moment');
const jwt = require('jsonwebtoken');

const multer = require("multer");
const fs = require('fs-extra');
const mime = require('mime');

moment.updateLocale('en');

var router = express.Router();

var portalModel = require('../models/db');

router.get('/', function (req, res, next) {
    res.render('index', { email: process.env.CONTACT_EMAIL });
});

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
        message: 'User ID is necessary.'
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
        message: 'Traffic ID is necessary.'
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
        message: 'Traffic ID is necessary.'
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
        message: 'Traffic ID is necessary.'
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
        message: 'Traffic ID is necessary.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is necessary.'
    });

    if (!message) return res.status(401).send({
        error: true,
        message: 'Message is necessary.'
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
        message: 'Traffic ID is necessary.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is necessary.'
    });

    if (!message) return res.status(401).send({
        error: true,
        message: 'Message is necessary.'
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
        message: 'Traffic ID is necessary.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is necessary.'
    });

    if (!unload_date) return res.status(401).send({
        error: true,
        message: 'Unload date is necessary.'
    });

    if (!moment(unload_date, 'YYYY-MM-DD HH:mm:ss', true).isValid()) return res.status(401).send({
        error: true,
        message: 'Unload date is not .'
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
        message: 'Traffic ID is necessary.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is necessary.'
    });

    if (!load_date) return res.status(401).send({
        error: true,
        message: 'Load date is necessary.'
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
        message: 'Traffic ID is necessary.'
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
    const qr = req.body.qr;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_bodega) return res.status(401).send({
        error: true,
        message: 'Warehouse ID is necessary.'
    });

    if (!id_trafico) return res.status(401).send({
        error: true,
        message: 'Traffic ID is necessary.'
    });

    if (!id_user) return res.status(401).send({
        error: true,
        message: 'User ID is necessary.'
    });

    if (!qr) return res.status(401).send({
        error: true,
        message: 'QR is necessary.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.agregarBulto(id_bodega, id_trafico, id_user, dano, observacion, qr, function (error, results) {
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
    const qr = req.body.qr;

    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    if (!id_bulto) return res.status(401).send({
        error: true,
        message: 'Package ID is necessary.'
    });

    jwt.verify(token, process.env.WSSECRET, function (err, decoded) {

        if (err) return res.status(500).send({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        portalModel.actualizarBulto(id_bulto, dano, observacion, qr, function (error, results) {
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

const upload = multer({dest: "D:\\xampp\\tmp"});

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
        message: 'Traffic ID is necessary.'
    });

    if (!id_bulto) return res.status(401).send({
        error: true,
        message: 'Package ID is necessary.'
    });

    if(req.file) {

        var filename_out = req.file.destination + "\\" + req.file.originalname;

        if (!fs.existsSync(filename_out)) {
            fs.move(req.file.path, filename_out, function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        }
        console.log(mime.getExtension(req.file.mimetype));
        res.json(req.file);
    }

});

module.exports = router;