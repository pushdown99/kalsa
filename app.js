import express from 'express';
import ejs from 'ejs';
import * as fs from 'fs';
import { TemplateHandler, MimeType } from 'easy-template-x';
import { convertWordFiles } from 'convert-multiple-files';
import moment from 'moment-timezone';

//const __dirname = new URL('.', import.meta.url).pathname;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;

var app = express();

console.log(__dirname);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(__dirname + '/public'));

async function test() {
  // Return promise => convertWordFiles(path of the file to be converted, convertTo, outputDir)
  const pathOutput = await convertWordFiles(path.resolve('./output.docx'), 'pdf', ".");
  console.log(pathOutput);
}

/*
import pdf from "./pdf.js";
pdf();
*/


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

async function writeWord(myjson) {
  const templateFile = fs.readFileSync('template.docx');

  let type1 = (myjson.type == 'type1')? "■":"□";
  let type2 = (myjson.type == 'type2')? "■":"□";
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
  let user1 = (myjson.user == 'user1')? "■":"□";
  let user2 = (myjson.user == 'user2')? "■":"□";
  let user3 = (myjson.user == 'user3')? "■":"□";
  let date = moment().format("YYYY. MM. DD.");

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
          source: fs.readFileSync("signature.png"),
          format: MimeType.Png,
          width: 100,
          height: 50
      }
      }
      ]
  };
  const handler = new TemplateHandler();
  const doc = await handler.process(templateFile, data);

  fs.writeFileSync('output.docx', doc);
  test();
}

app.get('/', function(req, res) {
  res.render('signpad');
});

app.post('/json/register', function (req, res) {
  var signature = req.body.signature;
  writeWord (req.body);
  var buffer = Buffer.from(signature, 'base64');


  fs.writeFileSync('signature.png', buffer, 'base64', err => {
    if (err) res.send('fail');
    else {
      res.send(req.body);
    }
  });
  //res.send(req.body);
});

app.get('/image', (req, res) => {
  let data = fs.readFileSync('signature.png');
  res.contentType("image/png");
  res.send (data);
});

app.get('/pdf', (req, res) => {

  let file = 'output.pdf';
  res.download (file);
});

app.listen(port, () => console.log(`Listening on ${ port }`));

