import express from 'express';
import http    from 'http';
import https   from 'https';
import ejs from 'ejs';
import * as fs from 'fs';
import { TemplateHandler, MimeType } from 'easy-template-x';
//import { convertWordFiles } from 'convert-multiple-files';
import toPdf from 'office-to-pdf';
import moment from 'moment-timezone';
import mail from 'nodemailer';

//const __dirname = new URL('.', import.meta.url).pathname;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let port_http  = process.env.PORT_HTTP  || 8083;
let port_https = process.env.PORT_HTTPS || 55100; // 55100

let pem_privateKey  = process.env.PEM_PRIVATEKEY || '/etc/letsencrypt/live/tric.kr/privkey.pem';
let pem_certificate = process.env.PEM_CERT       || '/etc/letsencrypt/live/tric.kr/cert.pem'   ;
let pem_ca          = process.env.PEM_CHAIN      || '/etc/letsencrypt/live/tric.kr/chain.pem'  ;

var app = express();


console.log(__dirname);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(__dirname + '/public'));

if (!fs.existsSync('pdf')){
  fs.mkdirSync('pdf');
}
if (!fs.existsSync('docx')){
  fs.mkdirSync('docx');
}
if (!fs.existsSync('signature')){
  fs.mkdirSync('signature');
}

function mailto (userid, From, Pass, To, Subject, Text, Callback) {
  let Send = mail.createTransport({ service: 'naver', host: 'smtp.naver.com', port: 587, auth: { user: From, pass: Pass, } });
  let Opts = {
    from: From, to: To, subject: Subject, text: Text, attachments: [
    { filename: `./pdf/output-${userid}.pdf`, content: fs.createReadStream(`./pdf/output-${userid}.pdf`) } ] };

  Send.sendMail(Opts, function(error, info){
    Callback (error, info);
  });
}

function writePDF(userid, name) {
  console.log(`- write output-${userid}.pdf`);
  var wordBuffer = fs.readFileSync(`./output-${userid}.docx`);

  toPdf(wordBuffer).then((pdfBuffer) => {
    fs.writeFileSync(`./output-${userid}.pdf`, pdfBuffer);
    console.log(`- write output-${userid}.pdf (after)`);
    
    console.log("- sending mail");
    let title = `???????????????????????? [${name} ???]`;
    mailto(userid, 'popup@naver.com', 'aq175312#$', 'haeyun@gmail.com', title, '?????????????????????????????????.', function (err, info) {
      if (err) console.log(err);
      else {
        console.log("- mailto success");
        return userid;
      }
    });
  });  
}


async function writeWORD(type, userid, myjson) {
  const templateFile = (type == 0)? fs.readFileSync('template.docx'): fs.readFileSync('template1.docx');

  let type1 = (myjson.type == 'type1')? "???":"???";
  let type2 = (myjson.type == 'type2')? "???":"???";
  let cname = myjson.cname;
  let name = myjson.name;
  let tel = myjson.tel;
  let fax = myjson.fax;
  let address = myjson.address;
  let r_name = myjson.r_name;
  let r_position = myjson.r_position;
  let r_mobile = myjson.r_mobile;
  let r_email = myjson.r_email;
  let id = myjson.id;
  let email = myjson.email;
  let user1 = (myjson.user == 'user1')? "???":"???";
  let user2 = (myjson.user == 'user2')? "???":"???";
  let user3 = (myjson.user == 'user3')? "???":"???";
  let date = moment().format("YYYY. MM. DD.");
  let signature = myjson.signature;
  let buffer = Buffer.from(signature, 'base64');

  fs.writeFileSync(`./signature/signature-${userid}.png`, buffer, 'base64');
  console.log(`- write signature-${userid}.png`);

  const data = {
      posts: [
      { 
      type1: `${type1}`,
        type2: `${type2}`,
        cname: `${cname}`,
        name: `${name}`,
        tel: `${tel}`,
        fax: `${fax}`,
        address: `${address}`,
        r_name: `${r_name}`,
        r_position: `${r_position}`,
        r_mobile: `${r_mobile}`,
        r_email: `${r_email}`,
        id: `${id}`,
        email: `${email}`,
        user1: `${user1}`,
        user2: `${user2}`,
        user3: `${user3}`,
        date: `${date}`,
        "signature": {
          _type: "image",
          source: fs.readFileSync(`./signature/signature-${userid}.png`),
          format: MimeType.Png,
          width: 100,
          height: 50
      }
      }
      ]
  };
  const handler = new TemplateHandler();
  const doc = await handler.process(templateFile, data);

  console.log(`- write output-${userid}.docx`);
  fs.writeFileSync(`./docx/output-${userid}.docx`, doc);
  console.log(`- write output-${userid}.docx (after)`);

  return userid;
}

/////////////////////////////////////////////////////////////////////////
//
// middleware
//
app.use(function (req, res, next) {
  req.timestamp  = moment().unix();
  req.receivedAt = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
  console.log(req.receivedAt + ': ', req.method, req.protocol +'://' + req.hostname + req.url);
  return next();
});

app.get('/', function(req, res) {
  res.redirect('/regular');
});

app.get('/1', function(req, res) {
  res.redirect('/regular');
});

app.get('/regular', function(req, res) {
  res.render('regular');
});

app.get('/2', function(req, res) {
  res.render('associate');
});

app.get('/associate', function(req, res) {
  res.render('associate');
});

app.get('/complete', function(req, res) {
  res.render('complete');
});

app.post('/json/preview', function (req, res) { 
  let userid = req.body.userid;
  let name   = req.body.name;

    writeWORD (0, userid, req.body).then((data) => {
      console.log ("after writeWORD");

      console.log(`- write output-${userid}.pdf`);
      var wordBuffer = fs.readFileSync(`./docx/output-${userid}.docx`);
  
      toPdf(wordBuffer).then((pdfBuffer) => {
        fs.writeFileSync(`./pdf/output-${userid}.pdf`, pdfBuffer);
        console.log(`- write output-${userid}.pdf (after)`);
        res.send(req.body);
      });  
    });
});

app.post('/json/submit', function (req, res) { 
  let userid = req.body.userid;
  let name = req.body.name;

    writeWORD (0, userid, req.body).then((data) => {
      console.log ("after writeWORD");

      console.log(`- write output-${userid}.pdf`);
      var wordBuffer = fs.readFileSync(`./docx/output-${userid}.docx`);
  
      toPdf(wordBuffer).then((pdfBuffer) => {
        fs.writeFileSync(`./pdf/output-${userid}.pdf`, pdfBuffer);
        console.log(`- write output-${userid}.pdf (after)`);
      
        console.log("- sending mail");
        let title = `???????????????????????? [${name} ???]`;
        mailto(userid, 'popup@naver.com', 'aq175312#$', 'liquorsafety@gmail.com', title, '?????????????????????????????????.', function (err, info) {
          if (err) console.log(err);
          else {
            console.log("- mailto success");
            res.send(req.body);
          }
        });
      });  
    });
});


app.post('/json/preview2', function (req, res) { 
  let userid = req.body.userid;
  let name = req.body.name;

    writeWORD (1, userid, req.body).then((data) => {
      console.log ("after writeWORD");

      console.log(`- write output-${userid}.pdf`);
      var wordBuffer = fs.readFileSync(`./docx/output-${userid}.docx`);
  
      toPdf(wordBuffer).then((pdfBuffer) => {
        fs.writeFileSync(`./pdf/output-${userid}.pdf`, pdfBuffer);
        console.log(`- write output-${userid}.pdf (after)`);
        res.send(req.body);
      });  
    });
});

app.post('/json/submit2', function (req, res) { 
  let userid = req.body.userid;
  let name = req.body.name;

    writeWORD (1, userid, req.body).then((data) => {
      console.log ("after writeWORD");

      console.log(`- write output-${userid}.pdf`);
      var wordBuffer = fs.readFileSync(`./docx/output-${userid}.docx`);
  
      toPdf(wordBuffer).then((pdfBuffer) => {
        fs.writeFileSync(`./pdf/output-${userid}.pdf`, pdfBuffer);
        console.log(`- write output-${userid}.pdf (after)`);
      
        console.log("- sending mail");
        let title = `??????????????????????????? [${name} ???]`;
        mailto(userid, 'popup@naver.com', 'aq175312#$', 'liquorsafety@gmail.com', title, '????????????????????????????????????.', function (err, info) {
          if (err) console.log(err);
          else {
            console.log("- mailto success");
            res.send(req.body);
          }
        });
      });  
    });
});

app.get('/pdf/:f', (req, res) => {
  let f = req.params.f;
  let d = 'pdf';
  let p = `./${d}/${f}`;
  console.log ('file:', p);
  try {
  let data = fs.readFileSync(p);
  res.contentType("application/pdf");
  res.send (data);
  } catch (err) {
    console.log(err);
  }

});

///////////////////////////////////////////////////////////////////////////////////

const privateKey  = fs.readFileSync(pem_privateKey, 'utf8');
const certificate = fs.readFileSync(pem_certificate, 'utf8');
const ca          = fs.readFileSync(pem_ca, 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};
const httpServer  = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(port_http, () => {
  console.log('Listener: ', 'http  listening on port ' + port_http);
});

httpsServer.listen(port_https, () => {
  console.log('Listener: ', 'https listening on port ' + port_https);
});


