var authorizationtoken = "d24f49c6f91d500e54b341e678e6d80144c0c518";
var repourl = "https://api.github.com/repositories/175385549/contents/js"; // has to be exact, because link with username and repo name redirect, which is not handles properly by firefox and edge (chrome works ok)
templatejson = {
  "title": "templatetitle"
};
function getSafe(fn, defaultVal) {
  try {
    return fn();
  } catch (e) {
    return defaultVal;
  }
}
 function readCookie(name) {
  var nameEQ = encodeURIComponent(name) + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}
$(function () {

  $('#tile_form').on('submit', function (e) {
    e.preventDefault();
    $("#foo").empty();
    $.ajax({
      url: repourl,
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "token " + authorizationtoken);
      },
      dataType: 'json',
      success: function (results) {
              resultsJSON = [];
        $.each(results, function (i, f) {
          var splitname = f.name.split("_");
          resultsJSON.push({
            updatedat: splitname[0],
            createdat: splitname[1],
            name: splitname[2]
          });
        });
        if (document.getElementById('nameasc').checked) {
          alert("nameasc");
          resultsJSON.sort(function (a, b) {
            return ('' + a.name).localeCompare(b.name);
          });
        } else if (document.getElementById('namedesc').checked) {
          alert("namedesc");
          resultsJSON.sort(function (a, b) {
            return -('' + a.name).localeCompare(b.name);
          });
        } else if (document.getElementById('createdasc').checked) {
          alert("createdasc");
          resultsJSON.sort(function (a, b) {
            return ('' + a.createdat).localeCompare(b.createdat);
          });
        } else if (document.getElementById('createddesc').checked) {
          alert("createddesc");
          resultsJSON.sort(function (a, b) {
            return -('' + a.createdat).localeCompare(b.createdat);
          });
        } else if (document.getElementById('updtedasc').checked) {
          alert("updtedasc");
          resultsJSON.sort(function (a, b) {
            return ('' + a.updatedat).localeCompare(b.updatedat);
          });
        } else if (document.getElementById('updteddesc').checked) {
          alert("updteddesc");
          resultsJSON.sort(function (a, b) {
            return -('' + a.updatedat).localeCompare(b.updatedat);
          });
        }
        resultsJSON.forEach(function (entry) {
var name = entry.updatedat +"_"+ entry.createdat +"_"+ entry.name;
          var parsedcreatedat = new Date(parseInt(entry.createdat));
          var parsedupdatedat = new Date(parseInt(entry.updatedat));
          var list = '<div class="col-md-3 cms-boxes-outer">                <div class="cms-boxes-items cms-features">                  <div class="boxes-align" data-toggle="modal" data-target="#expandedTile" id="' + name + '">                    <div class="small-box">                      <i class="fa fa-4x fa-laptop">&nbsp;</i>                        <p>' + entry.name + '</p><p> updated at: ' + parsedupdatedat + '</p><p> created at: ' + parsedcreatedat + '</p>                    </div>                  </div>                </div>              </div>  ';
          $(list).appendTo("#foo");
        });
      },
    });

  });
  $('.container-fluid').on('click', '.boxes-align', function (e) {
    e.stopPropagation();
    $.ajax({
        url: repourl + '/' + $(this).attr('id'),
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", "token " + authorizationtoken);
        },
        dataType: 'json',
        success: function (response) {
          currentresponse = response;
          content = atob(response.content);
          unencodedcontent = getSafe(() => JSON.parse(content), templatejson);
          var title = unencodedcontent.title; // will not throw exception if templatejson is properly defined
          document.getElementById('page-title').innerHTML = title;
          $('#expandedTile').modal('show');
        }
      })
      .fail(function () {
        alert('That entry is no longer avaliable');
      });
  });
});
$(function () {
  $('#file_create_form').on('submit', function (e) {
    e.preventDefault();
    $.ajax({
      url: repourl + '/' + $('#createdat').val() + '_' + $('#createdat').val() + '_' + $('#filename').val(),
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "token " + authorizationtoken);
      },
      type: 'PUT',
      data: '{"message": "create file","content":"' + btoa($('#filecontent').val()) + '" }',
      success: function (data) {
        alert('File create was performed. Passed data: ' + JSON.stringify(data));
        $('#createform').modal('hide');
      }
    });
  });
});
$(function () {
  $('#eventdelete').on('click', function (e) {
    e.preventDefault();
    var action = confirm('Are you sure you wish to delete this item ? It cannot be undone!');
    if(action === false) {
       return false; // this would do
    }
    $.ajax({
      url: repourl + '/' + currentresponse.name,
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "token " + authorizationtoken);
      },
      type: 'DELETE',
      data: '{"message": "delete file","sha":"' + currentresponse.sha + '" }',
      success: function (data) {
        alert('Delete was performed. Passed data: ' + JSON.stringify(data));
        $('#expandedTile').modal('hide');
      }
    });
  });
});
$(function () {
  $('#eventedit').on('click', function (e) {
    updatedat = new Date().getTime();
    e.preventDefault();
    document.getElementById("updatedatedited").value = updatedat;
    document.getElementById("createdatedited").value = getSafe(() => currentresponse.name.split(/_(.+)/)[1].split(/_(.+)/)[0], updatedat);
    document.getElementById("filenameedited").value = getSafe(() => currentresponse.name.split(/_(.+)/)[1].split(/_(.+)/)[1], 'default');
    document.getElementById("filecontentedited").value = content;
  });
});
$(function () {
  $('#createbutton').on('click', function (e) {
    var createdat = new Date().getTime();
    e.preventDefault();
    document.getElementById("createdat").value = createdat;
    document.getElementById("filename").value = "";
    document.getElementById("filecontent").value = "";
  });
});
$(function () {
  $('#file_edit_form').on('submit', function (e) {
    e.preventDefault();
    var dataforcreate = '{"message": "edit file","content":"' + btoa($('#filecontentedited').val()) + '" }';
    var datafordelete = '{"message": "delete file","sha":"' + currentresponse.sha + '" }';
    $.ajax({
      url: repourl + '/' + $('#updatedatedited').val() + '_' + getSafe(() => currentresponse.name.split(/_(.+)/)[1].split(/_(.+)/)[0], updatedat) + '_' + $('#filenameedited').val(),
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "token " + authorizationtoken);
      },
      type: 'PUT',
      data: dataforcreate,
    }).done(function (data) {
      alert('File edit was performed. Passed data: ' + JSON.stringify(data));
      $.ajax({
        url: repourl + '/' + currentresponse.name,
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", "token " + authorizationtoken);
        },
        type: 'DELETE',
        data: datafordelete,
      }).done(function (data) {
        alert('Delete of preedited file was performed. Passed data: ' + JSON.stringify(data));
        $('#editform').modal('hide');
      });
    });
  });
});
// $(function () {
//   if (!readCookie('adminview')) {
//     $('#createbutton').hide();
//     $('#eventdelete').hide();
//     $('#eventedit').hide();
//   } else {
//     $('#createbutton').show();
//     $('#eventdelete').show();
//     $('#eventedit').show();
//   }
// });