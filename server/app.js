var fs = require('file-system');
var url = require('url');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var file = require("./scripts/filemodule.js");
var app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var templates = "./templates/";
var korisniciFajl = "./files/korisnici.json";
var sadrzajFajl = "./files/sadrzaj.json";

var korisnici = file.ucitajIzFajla(korisniciFajl);
var sadrzaj = file.ucitajIzFajla(sadrzajFajl);

// Ako gadjamo default, treba da se vrati ova stranica.
app.get('/', function (req, res) {
  var html = fs.readFileSync(templates + 'home.html');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

// HTML kod.
app.get('/templates/*', function (req, res) {
  var html = fs.readFileSync("." + req.path);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

app.get('/login', function (req, res) {
  var html = fs.readFileSync("./templates" + req.path + ".html");
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

// Sav CSS je ovdje.
app.get('/styles/*', function (req, res) {
  var css = fs.readFileSync("." + req.path);
  res.writeHead(200, { 'Content-Type': 'text/css' });
  res.end(css);
});

// Sav JS kod je u scripts folderu.
app.get('/scripts/*', function (req, res) {
  var js = fs.readFileSync("." + req.path);
  res.writeHead(200, { 'Content-Type': 'text/javascript' });
  res.end(js);
});

app.get('/element', function(req, res) {
  var html = fs.readFileSync("./templates" + req.path + ".html");
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
})

app.get('/elementData*', function (req, res) {
  var ret = null;
  if (Object.keys(req.query).length === 0)
    notFound(req, res);
  var id = req.query.id;
  ret = sadrzaj.find(function(element) {
    return element.id == id;
  })
  ret = JSON.stringify(ret);
  console.log("Vracam " + ret);
  res.writeHead(200, { 'Content-Type': 'text/json' });
  res.end(ret);
});

function notFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>Not found :(.<h1>');
}


app.get('/sadrzaj', function (req, res) {
  var ret = null;
  if (Object.keys(req.query).length === 0)
    ret = JSON.stringify(sadrzaj);
  else
    ret = JSON.stringify(search(req.query));
  
  res.writeHead(200, { 'Content-Type': 'text/json' });
  res.end(ret);  
});

function search(query) {
  var q = query.criteria.toLowerCase();
  return sadrzaj.filter(function(elem) {
    return elem.title.toLowerCase().includes(q);
  })
}

// Svi ostali resursi, uglavnom se odnosi na slike.
app.get('/resources/*', function (req, res) {
  res.sendFile(req.path, { root: path.join(__dirname, '.') });
});

// Samo primjer POST metode.
app.post('/logintest/', function (req, res) {
  var korisnik = null;
  for (i = 0; i < korisnici.length; i++) {
    if (req.body.korisnickoIme == korisnici[i].korisnickoIme && req.body.sifra == korisnici[i].sifra) {
      korisnik = korisnici[i];
      break;
    }
  }

  if (korisnik) {
    res.writeHead(200, { "Content-Type": 'text/html' });
    res.end("Uspeli ste da se ulogujete kao " + korisnik.korisnickoIme);
  }
  else {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('Niste uspeli da se ulogujete');
  }
});

app.post('/registertest/', function (req, res) {
  var noviKorisnik = new Object;
  noviKorisnik.ime = req.body.ime;
  noviKorisnik.sifra = req.body.sifra;
  noviKorisnik.id = korisnici.length;
  korisnici.push(noviKorisnik);
  file.pisiUFajl(korisniciFajl, korisnici);
  res.redirect("/");
});

port = 3000;
app.listen(port);
console.log('Listening at http://localhost:' + port)