import express from 'express';
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

const port = process.env.PORT || 8083;

var app = express();


console.log(__dirname);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(__dirname + '/public'));

function mailto (userid, From, Pass, To, Subject, Text, Callback) {
  let Send = mail.createTransport({ service: 'naver', host: 'smtp.naver.com', port: 587, auth: { user: From, pass: Pass, } });
  let Opts = {
    from: From, to: To, subject: Subject, text: Text, attachments: [
    { filename: `output-${userid}.pdf`, content: fs.createReadStream(`output-${userid}.pdf`) } ] };

  Send.sendMail(Opts, function(error, info){
    Callback (error, info);
  });
}

async function writePDF(userid, name) {
  console.log(`- write output-${userid}.pdf`);
  var wordBuffer = fs.readFileSync(`./output-${userid}.docx`);

  toPdf(wordBuffer).then(
    (pdfBuffer) => {
      fs.writeFileSync(`./output-${userid}.pdf`, pdfBuffer)
      if (fs.existsSync(`output-${userid}.pdf`)) {
        console.log(`- output-${userid}.pdf file exist`);

        console.log("- sending mail");
        let title = `정회원가입신청서 [${name} 님]`;
        mailto(userid, 'popup@naver.com', 'aq175312#$', 'haeyun@gmail.com', title, '정회원가입신청서입니다.', function (err, info) {
          if (err) console.log(err);
          else {
            console.log("- mailto success");
            return userid;
          }
        });
      }
    }, (err) => {
      console.log(err)
    }
  )
  /*
  const pathOutput = await convertWordFiles(path.resolve(__dirname,'output.docx'), 'pdf', path.resolve(__dirname));
  console.log(pathOutput);
  */
}


async function writeWORD(userid, myjson) {
  const templateFile = fs.readFileSync('template.docx');

  //if (fs.existsSync("output.docx"))   { fs.unlinkSync("output.docx");   }
  //if (fs.existsSync("output.pdf"))    { fs.unlinkSync("output.pdf");    }
  //if (fs.existsSync("signature.png")) { fs.unlinkSync("signature.png"); }

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
  let signature = myjson.signature;
  let buffer = Buffer.from(signature, 'base64');

  fs.writeFileSync(`signature-${userid}.png`, buffer, 'base64');
  console.log(`- write signature-${userid}.png`);
  if (fs.existsSync(`signature-${userid}.png`)) {
    console.log(`- signature-${userid}.png file exist`);
  }

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
          source: fs.readFileSync(`signature-${userid}.png`),
          format: MimeType.Png,
          width: 100,
          height: 50
      }
      }
      ]
  };
  const handler = new TemplateHandler();
  const doc = await handler.process(templateFile, data);

  fs.writeFileSync(`output-${userid}.docx`, doc);

  console.log(`- write output-${userid}.docx`);
  if (fs.existsSync(`output-${userid}.docx`)) {
    console.log(`- output-${userid}.docx file exist`);
    return userid;
    //writePDF(userid, name).then((data) => {
    //  console.log ("- write pdf completed", data);
    //  return data;
    //});
  }
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
  res.render('signpad');
});

app.post('/json/register', function (req, res) { 
  let userid = req.body.userid = moment().format("YYYYMMDD-HHmmss");
  let name = req.body.name;

  writeWORD (userid, req.body).then((data) => {
    console.log ("after writeWORD");
    writePDF(userid, name).then((data) => {
      console.log ("after writePDF");
      res.send(req.body);
    }); 
  }
  );
  /*
  fs.writeFileSync('signature.png', buffer, 'base64', err => {
    console.log("inner");
    if (err) res.send('fail');
    else {
      writeWord (req.body);
      res.send(req.body);
    }
  });
  */
  //console.log ("res.send");
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

