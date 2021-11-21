///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// jQuery EXTEND
//
$.extend({
    postJSON: function(url, body) {
      return $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(body),
        contentType: "application/json",
        dataType: 'json'
      });
    },
  
    postFORM: function(url, formData) {
      $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: url,
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
        success: function (data) {
          console.log("SUCCESS : ", data);
        },
        error: function (e) {
          console.log("ERROR : ", e);
        }
      });
    },
});

function dynamicAlert (body) {
  $("#alert-body").html(body);
  $("#modal-alert").modal('show');
}

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function alphanumeric (val) { 
  var letters = /^[0-9a-zA-Z]+$/;
  if(val.match(letters)) return true;
  else return false;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// jQuery READY
//
var viewReceipt = null;
var userid = moment().format("YYYYMMDD-HHmmss");

viewReceipt = function (file) {
  console.log('call viewReceipt:', file);
  $("#exampleModal").on("shown.bs.modal", function () {
     $(this).find('.modal-body').css({
            width:'auto', //probably not needed
            height:'auto', //probably not needed
            'max-height':'100%'
     });
     $(this).find("#pdf").attr("data", file);
     console.log ('view:', file)
  }).modal('show');
}

$('#preview').on('click', function(event) {
  var canvas    = document.getElementById("signature-pad");
  var sign = canvas.toDataURL('image/png').replace(/\s/g, '+').replace(/^data:image\/png;base64,/, '');

  var params = {
    userid     : userid,
    type       : $('input[type=radio][name=type]:checked').val(),
    cname      : $('#cname').val(),
    name       : $('#name').val(),
    tel        : $('#tel').val(),
    fax        : $('#fax').val(),
    address    : $('#address').val(),
    r_name     : $('#r_name').val(),
    r_position : $('#r_position').val(),
    r_mobile   : $('#r_mobile').val(),
    r_email    : $('#r_email').val(),
    id         : $('#id').val(),
    email      : $('#email').val(),
    user       : $('input[type=radio][name=user]:checked').val(),
    got_sign   : $('#got_sign').val(),
    signature  : sign
  }
  
  if (params.cname == "")                          dynamicAlert ("회사명을 입력해주세요");
  else if (params.name == "")                      dynamicAlert ("대표자명을 입력해주세요");
  else if (params.tel == "")                       dynamicAlert ("연락처를 입력해주세요");
  else if (params.r_name == "")                    dynamicAlert ("담당자명을 입력해주세요");
  else if (params.r_mobile == "")                  dynamicAlert ("담당자 연락처를 입력해주세요");
  else if (params.r_email == "")                   dynamicAlert ("담당자 이메일을 입력해주세요");
  else if (validateEmail(params.r_email) == false) dynamicAlert ("정상적인 담당자 이메일을 입력해주세요");
  else if (params.id == "")                        dynamicAlert ("ID를 입력해주세요");
  else if (alphanumeric(params.id) == false)       dynamicAlert ("ID는 영문과 숫자로만 입력해주세요")
  else if (params.id.length <= 5)                     dynamicAlert ("ID는 최소한 6글자 이상으로 직성해주세요")
  else if (params.email == "")                     dynamicAlert ("회원가입용 이메일을 입력해주세요");
  else if (validateEmail(params.email) == false)   dynamicAlert ("정상적인 회원가입용 이메일을 입력해주세요");
  else if (params.got_sign != "1")                 dynamicAlert ("서명을 해주세요");
  else {
    console.log(params);
    console.log(JSON.stringify(params));

    $.postJSON('/json/preview', params).then(res => {
      viewReceipt (`/pdf/output-${res.userid}.pdf`);
      console.log(res);
    });
  }
});

$('#submit').on('click', function(event) {
  var canvas    = document.getElementById("signature-pad");
  var sign = canvas.toDataURL('image/png').replace(/\s/g, '+').replace(/^data:image\/png;base64,/, '');

  var params = {
    userid     : userid,
    type       : $('input[type=radio][name=type]:checked').val(),
    cname      : $('#cname').val(),
    name       : $('#name').val(),
    tel        : $('#tel').val(),
    fax        : $('#fax').val(),
    address    : $('#address').val(),
    r_name     : $('#r_name').val(),
    r_position : $('#r_position').val(),
    r_mobile   : $('#r_mobile').val(),
    r_email    : $('#r_email').val(),
    id         : $('#id').val(),
    email      : $('#email').val(),
    user       : $('input[type=radio][name=user]:checked').val(),
    got_sign   : $('#got_sign').val(),
    signature  : sign
  }
  
  if (params.cname == "")                          dynamicAlert ("회사명을 입력해주세요");
  else if (params.name == "")                      dynamicAlert ("대표자명을 입력해주세요");
  else if (params.tel == "")                       dynamicAlert ("연락처를 입력해주세요");
  else if (params.r_name == "")                    dynamicAlert ("담당자명을 입력해주세요");
  else if (params.r_mobile == "")                  dynamicAlert ("담당자 연락처를 입력해주세요");
  else if (params.r_email == "")                   dynamicAlert ("담당자 이메일을 입력해주세요");
  else if (validateEmail(params.r_email) == false) dynamicAlert ("정상적인 담당자 이메일을 입력해주세요");
  else if (params.id == "")                        dynamicAlert ("ID를 입력해주세요");
  else if (alphanumeric(params.id) == false)       dynamicAlert ("ID는 영문과 숫자로만 입력해주세요")
  else if (params.id.length <= 5)                     dynamicAlert ("ID는 최소한 6글자 이상으로 직성해주세요")
  else if (params.email == "")                     dynamicAlert ("회원가입용 이메일을 입력해주세요");
  else if (validateEmail(params.email) == false)   dynamicAlert ("정상적인 회원가입용 이메일을 입력해주세요");
  else if (params.got_sign != "1")                 dynamicAlert ("서명을 해주세요");
  else {
    console.log(params);
    console.log(JSON.stringify(params));

    $.postJSON('/json/submit', params).then(res => {
      viewReceipt (`/pdf/output-${res.userid}.pdf`);
      console.log(res);
    });
  }
});

$('#preview2').on('click', function(event) {
  var canvas    = document.getElementById("signature-pad");
  var sign = canvas.toDataURL('image/png').replace(/\s/g, '+').replace(/^data:image\/png;base64,/, '');

  var params = {
    userid     : userid,
    type       : $('input[type=radio][name=type]:checked').val(),
    cname      : $('#cname').val(),
    tel        : $('#tel').val(),
    r_mobile   : $('#r_mobile').val(),
    name       : $('#name').val(),
    r_email    : $('#r_email').val(),
    address    : $('#address').val(),
    id         : $('#id').val(),
    email      : $('#email').val(),
    user       : $('input[type=radio][name=user]:checked').val(),
    got_sign   : $('#got_sign').val(),
    signature  : sign
  }
  
  console.log (validateEmail(params.email));

  if (params.name == "")                              dynamicAlert ("이름을 입력해주세요");
  else if (params.tel == "" && params.r_mobile == "") dynamicAlert ("전화번호 또는 휴대전화번호를 입력해주세요");
  else if (params.r_email == "")                      dynamicAlert ("이메일을 입력해주세요");
  else if (validateEmail(params.r_email) == false)    dynamicAlert ("정상적인 이메일을 입력해주세요");
  else if (params.id == "")                           dynamicAlert ("ID를 입력해주세요");
  else if (alphanumeric(params.id) == false)          dynamicAlert ("ID는 영문과 숫자로만 입력해주세요")
  else if (params.id.length <= 5)                     dynamicAlert ("ID는 최소한 6글자 이상으로 직성해주세요")
  else if (params.email == "")                        dynamicAlert ("회원가입용 이메일을 입력해주세요");
  else if (validateEmail(params.email) == false)      dynamicAlert ("정상적인 회원가입용 이메일을 입력해주세요");
  else if (params.got_sign != "1")                    dynamicAlert ("서명을 해주세요");
  else {
    console.log(params);
    console.log(JSON.stringify(params));

    $.postJSON('/json/preview2', params).then(res => {
      viewReceipt (`/pdf/output-${res.userid}.pdf`);
      console.log(res);
    });
  }
});


$('#submit2').on('click', function(event) {
  var canvas    = document.getElementById("signature-pad");
  var sign = canvas.toDataURL('image/png').replace(/\s/g, '+').replace(/^data:image\/png;base64,/, '');

  var params = {
    userid     : userid,
    type       : $('input[type=radio][name=type]:checked').val(),
    cname      : $('#cname').val(),
    tel        : $('#tel').val(),
    r_mobile   : $('#r_mobile').val(),
    name       : $('#name').val(),
    r_email    : $('#r_email').val(),
    address    : $('#address').val(),
    id         : $('#id').val(),
    email      : $('#email').val(),
    user       : $('input[type=radio][name=user]:checked').val(),
    got_sign   : $('#got_sign').val(),
    signature  : sign
  }
  
  console.log (validateEmail(params.email));

  if (params.name == "")                              dynamicAlert ("이름을 입력해주세요");
  else if (params.tel == "" && params.r_mobile == "") dynamicAlert ("전화번호 또는 휴대전화번호를 입력해주세요");
  else if (params.r_email == "")                      dynamicAlert ("이메일을 입력해주세요");
  else if (validateEmail(params.r_email) == false)    dynamicAlert ("정상적인 이메일을 입력해주세요");
  else if (params.id == "")                           dynamicAlert ("ID를 입력해주세요");
  else if (alphanumeric(params.id) == false)          dynamicAlert ("ID는 영문과 숫자로만 입력해주세요")
  else if (params.id.length <= 5)                     dynamicAlert ("ID는 최소한 6글자 이상으로 직성해주세요")
  else if (params.email == "")                        dynamicAlert ("회원가입용 이메일을 입력해주세요");
  else if (validateEmail(params.email) == false)      dynamicAlert ("정상적인 회원가입용 이메일을 입력해주세요");
  else if (params.got_sign != "1")                    dynamicAlert ("서명을 해주세요");
  else {
    console.log(params);
    console.log(JSON.stringify(params));

    $.postJSON('/json/submit2', params).then(res => {
      viewReceipt (`/pdf/output-${res.userid}.pdf`);
      console.log(res);
    });
  }
});
