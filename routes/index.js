const express = require('express');

const moment = require('moment');
moment.updateLocale('en');

const portalModel = require('../models/db');
const fs = require('fs-extra');
const path  = require('path');
const handlebars = require('handlebars');

const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// http://localhost:3005/template?id=80509
router.get('/template', function (req, res, next) {

    const id_trafico = req.query.id;

    console.log(id_trafico);

    portalModel.detalleTrafico(id_trafico, function (error, results) {
        if (results.error === undefined) {
          console.log(results);
        }
        let source = fs.readFileSync(path.resolve(__dirname, '../views/templates/new-comment.html'), 'utf-8');

        let template = handlebars.compile(source);

        let html_output = template({
            message: "El embarque no ha salido.",
            referencia: results[0].referencia,
            nombre_cliente: results[0].nombre_cliente,
            bl_guia: results[0].bl_guia
        });

        res.send(html_output);
    });

    //res.render('index', { title: 'Express' });
});

module.exports = router;
