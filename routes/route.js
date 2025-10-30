const express = require('express');
const router = express.Router();

const mainRoute = require("./main/route");
const genreRoute = require("./genre/route");

router.use('/', mainRoute);
router.use('/genre', genreRoute);

module.exports= router;