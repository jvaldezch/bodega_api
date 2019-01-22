const express = require('express');
const moment = require('moment');
const jwt = require('jsonwebtoken');

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

module.exports = router;