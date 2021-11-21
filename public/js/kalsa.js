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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// jQuery READY
//

viewReceipt = function (file) {
  console.log('call viewReceipt:', file);
  $("#exampleModal").on("shown.bs.modal", function () {
     $(this).find('.modal-body').css({
            width:'auto', //probably not needed
            height:'auto', //probably not needed
            'max-height':'100%'
     });
     $(this).find("#pdf").attr("data", file);
  }).modal('show');
}

$('#save').on('click', function(event) {
  var canvas    = document.getElementById("signature-pad");
  var sign = canvas.toDataURL('image/png').replace(/\s/g, '+').replace(/^data:image\/png;base64,/, '');

  var params = {
    type       : $('input[type=radio][name=type]:checked').val(),
    user       : $('input[type=radio][name=user]:checked').val(),
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
    signature  : sign
  }
  if (params.user == "") dynamicAlert ("대표자명을 입력해주세요");
  if (params.user == "") dynamicAlert ("대표자명을 입력해주세요");

  console.log(params);
  console.log(JSON.stringify(params));

  $.postJSON('/json/register', params).then(res => {
    viewReceipt (`output-${res.userid}.pdf`);
    console.log(res);
  });
});

