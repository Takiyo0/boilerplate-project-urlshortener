require('dotenv').config();
const express = require('express');
const cors = require('cors');
const quickDb = require("quick.db");
const bodyParser = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3090;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
    res.json({greeting: 'hello API'});
});

app.get("/api/shorturl/:id", (req, res) => {
    let params = req.params;
    if (!params.id) return res.status(500).json({error: "internal server error (500)"});
    const links = quickDb.get("links");
    const result = Array.isArray(links) ? links.find(x => x.short === params.id) : undefined;
    if (!result || !result.url) return res.status(404).json({error: "Not found"});
    return res.redirect(result.url);
});

app.post("/api/shorturl", (req, res) => {
    let body = req.body;
    let url = body.url;
    if (!url || !checkValidUrl(url)) return res.status(200).json({error: "invalid url"});
    let shortUrl = randomString(5);
    quickDb.push("links", {
        short: shortUrl,
        url: url
    })
    return res.status(200).json({short_url: shortUrl, original_url: url});
});

app.use("/:id", (req, res) => {
    let params = req.params;
    if (!params.id) return res.status(500).json({error: "internal server error (500)"});
    const links = quickDb.get("links");
    const result = Array.isArray(links) ? links.find(x => x.short === params.id) : undefined;
    if (!result || !result.url) return res.status(404).json({error: "Not found"});
    return res.redirect(result.url);
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});


function checkValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

function randomString(length) {
    let words = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRTSUVWXYZ1234567890";
    words = words.split("");
    let string = "", currentLength = 0;

    while (currentLength < length) {
        currentLength += 1;
        string += words[Math.floor(Math.random() * words.length)];
    }
    return string;
}
