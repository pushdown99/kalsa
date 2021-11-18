var docxConverter = require('docx-pdf');

docxConverter('./output.docx','./output.pdf',function(err,result){
  if(err){
    console.log(err);
  }
  console.log('result'+result);
});
