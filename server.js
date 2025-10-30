const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();

app.use(cors());

const port = process.env.APP_PORT || 3000

const route = require("./routes/route")

app.get('/', (req,res)=>{
    res.status(200).json({
        "route list":{
            "terbaru": "/komik/terbaru",
            "list": "/komik/list",
            "search": "/komik/search?q=keyword",
            "detail": "/komik/detail/:slug",
            "chapter": "/komik/chapter/:slug",
            "all genre list": "/komik/genre/list",
            "by genre list": "/komik/genre/:slug"
        }
    })
})

app.use('/komik', route)

app.listen(port, ()=>{
    console.log(`server running in port ${port}`)
})