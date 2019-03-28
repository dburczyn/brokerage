var authorizationtoken = ""; //store it securely, not in plaintext here !!
var repourl = "https://api.github.com/repositories/175385549/contents/js"; // has to be exact, because link with username and repo name redirect, which is not handles properly by firefox and edge (chrome works ok)
templatejson = {
  "title": "templatetitle"
};
var locale = "en-GB";
var options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
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
  $('#getevents').on('click', function (e) {
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
            datetype: splitname[2],
            name: splitname[3],
            type: splitname[4]
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
          var name = entry.updatedat + "_" + entry.createdat + "_" + entry.datetype + "_" + entry.name + "_" + entry.type;
          var parsedcreatedat = new Date(parseInt(entry.createdat)).toLocaleDateString(locale, options);
          var parsedupdatedat = new Date(parseInt(entry.updatedat)).toLocaleDateString(locale, options);
          var bgcolor = "";
          var icon = "";
          var handle = "";
          if (entry.type === "event") {
            bgcolor = "#c4d1cf";
            icon = '<i class="far fa-calendar-alt fa-3x">&nbsp;</i>';
            handle = "Date: ";
          } else if (entry.type === "job") {
            bgcolor = "#c9cadc";
            icon = '<i class="fas fa-briefcase fa-3x">&nbsp;</i>';
            handle = "Type: ";
          } else if (entry.type === "training") {
            bgcolor = "#c5dee7";
            icon = '<i class="fas fa-chalkboard-teacher fa-3x">&nbsp;</i>';
            handle = "Date: ";
          }
          var list = '<div class="col-md-3 cms-boxes-outer">                <div class="cms-boxes-items cms-features" style="background-color:' + bgcolor + '">                  <div class="boxes-align" data-toggle="modal" data-target="#expandedTile" id="' + name + '">                    <div class="small-box">             <br>         ' + icon + '                       <h3>' + entry.name + '</h3><h3>' + handle + entry.datetype + '</h3><h3>Last update: ' + parsedupdatedat + '</h3><h3> Created: ' + parsedcreatedat + '</h3>                    </div>                  </div>                </div>              </div>  ';
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
          document.getElementById('modal-title').innerHTML = response.name.split("_")[3];
          document.getElementById('datetype').innerHTML = response.name.split("_")[2];
          document.getElementById('dateofcreate').innerHTML = new Date(parseInt(response.name.split("_")[1])).toLocaleDateString(locale, options);
          document.getElementById('dateofupdate').innerHTML = new Date(parseInt(response.name.split("_")[0])).toLocaleDateString(locale, options);
          document.getElementById('currentPhoto').src = unencodedcontent.picture;
          document.getElementById('mailbutton').href = 'mailto:' + unencodedcontent.email;
          document.getElementById('description').innerHTML = unencodedcontent.description;
          $('#expandedTile').modal('show');
        }
      })
      .fail(function () {
        alert('That entry is no longer avaliable');
      });
  });
});
$(function () {
  $('#event_create_form').on('submit', function (e) {
    e.preventDefault();
    var content = {};
    content.description = $('#filecontent').val();
    content.picture = $('#eventpicture').val();
    content.email = $('#emailaddress').val();
    var typesradio = document.getElementsByName('type');
    var type;
    for (var i = 0, length = typesradio.length; i < length; i++) {
      if (typesradio[i].checked) {
        type = typesradio[i].value;
        break;
      }
    }
    var handler;
    if (type === 'event' || type === 'training') {
      handler = $('#eventdate').val();
    } else if (type === 'job') {
      var jobtypesradio = document.getElementsByName('jobtype');
      for (var j = 0, l = jobtypesradio.length; i < l; i++) {
        if (jobtypesradio[i].checked) {
          handler = jobtypesradio[i].value;
          break;
        }
      }
    }
    $.ajax({
      url: repourl + '/' + $('#createdat').val() + '_' + $('#createdat').val() + '_' + handler + '_' + $('#filename').val() + '_' + type,
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "token " + authorizationtoken);
      },
      type: 'PUT',
      data: '{"message": "create file","content":"' + btoa(JSON.stringify(content)) + '" }',
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
    if (action === false) {
      return false;
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
    document.getElementById("createdatedited").value = currentresponse.name.split("_")[1];
    document.getElementById("filenameedited").value = currentresponse.name.split("_")[3];
    document.getElementById("filecontentedited").value = unencodedcontent.description;
    document.getElementById("emailaddressedited").value = unencodedcontent.email;
    document.getElementById("eventpictureedited").value = unencodedcontent.picture;
    var typesradionew = document.getElementsByName('typeedited');
    var jobtypeedited;
    for (var i = 0, length = typesradionew.length; i < length; i++) {
      if (currentresponse.name.split("_")[4] === typesradionew[i].value) {
        typesradionew[i].checked = true;
        jobtypeedited = typesradionew[i].value;
        console.log(jobtypeedited);
        break;
      }
    }
    if (jobtypeedited === 'event') {
      $("#extraeditformfields").empty();
      inp = '    <p>Event date: </p><input type="date" id="eventdateedited" name="eventdateedited" required><br>';
      $(inp).appendTo("#extraeditformfields");
    } else if (jobtypeedited === 'training') {
      $("#extraeditformfields").empty();
      inp = '    <p>Training date: </p><input type="date" id="eventdateedited" name="eventdateedited" required><br>';
      $(inp).appendTo("#extraeditformfields");
    } else if (jobtypeedited === 'job') {
      $("#extraeditformfields").empty();
      inp = '    <p>Job type: </p><p><input type="radio" name="jobtypeedited" value="Employment" checked> Employment   <input type="radio" name="jobtypeedited" value="Training"> Training<br>    <input type="radio" name="jobtypeedited" value="Internship"> Internship<br><input type="radio" name="jobtypeedited" value="Master"> Master<br><input type="radio" name="jobtypeedited" value="PhD"> PhD<br> </p>';
      $(inp).appendTo("#extraeditformfields");
    }
    if (jobtypeedited === 'event' || jobtypeedited === 'training') {
      document.getElementById("eventdateedited").value = currentresponse.name.split("_")[2];
    } else if (jobtypeedited === 'job') {
      console.log("pajszlo");
      var typeseditedradionew = document.getElementsByName('jobtypeedited');
      for (var j = 0, l = typeseditedradionew.length; j < l; j++) {
        console.log(currentresponse.name.split("_")[2]);
        console.log(typeseditedradionew[j].value);
        if (currentresponse.name.split("_")[2] === typeseditedradionew[j].value) {
          typeseditedradionew[j].checked = true;
          break;
        }
      }
    }
  });
});
$(function () {
  $('#createbutton').on('click', function (e) {
    var createdat = new Date().getTime();
    e.preventDefault();
    $("#extraformfields").empty();
    document.getElementById("createdat").value = createdat;
    document.getElementById("filename").value = "";
    document.getElementById("filecontent").value = "";
    document.getElementById("emailaddress").value = "";
    document.getElementById("eventpicture").value = "";
    var typesradionew = document.getElementsByName('type');
    for (var i = 0, length = typesradionew.length; i < length; i++) {
      if (typesradionew[i].checked) {
        typesradionew[i].checked = false;
      }
    }
  });
});
$(function () {
  $('#file_edit_form').on('submit', function (e) {
    e.preventDefault();
    var contentedited = {};
    contentedited.description = $('#filecontentedited').val();
    contentedited.picture = $('#eventpictureedited').val();
    contentedited.email = $('#emailaddressedited').val();
    var dataforcreate = '{"message": "edit file","content":"' + btoa(JSON.stringify(contentedited)) + '" }';
    var datafordelete = '{"message": "delete file","sha":"' + currentresponse.sha + '" }';
    var typesradioedited = document.getElementsByName('typeedited');
    var typeedited;
    for (var i = 0, length = typesradioedited.length; i < length; i++) {
      if (typesradioedited[i].checked) {
        typeedited = typesradioedited[i].value;
        break;
      }
    }
    var handler;
    if (typeedited === 'event' || typeedited === 'training') {
      handler = $('#eventdateedited').val();
    } else if (typeedited === 'job') {
      var jobtypesradio = document.getElementsByName('jobtypeedited');
      for (var j = 0, l = jobtypesradio.length; i < l; i++) {
        if (jobtypesradio[i].checked) {
          handler = jobtypesradio[i].value;
          break;
        }
      }
    }
    $.ajax({
      url: repourl + '/' + $('#updatedatedited').val() + '_' + currentresponse.name.split("_")[1] + '_' + handler + '_' + $('#filenameedited').val() + '_' + typeedited,
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
$(function () {
  $(document).ready(function () {
    $("#getevents").trigger("click");
  });
});
$(function () {
  var inp;
  $('input[name="type"]').click(function (e) {
    if (e.target.value === 'event') {
      $("#extraformfields").empty();
      inp = '    <p>Event date: </p><input type="date" id="eventdate" name="eventdate" required><br>';
      $(inp).appendTo("#extraformfields");
    } else if (e.target.value === 'training') {
      $("#extraformfields").empty();
      inp = '    <p>Training date: </p><input type="date" id="eventdate" name="eventdate" required><br>';
      $(inp).appendTo("#extraformfields");
    } else if (e.target.value === 'job') {
      $("#extraformfields").empty();
      inp = '    <p>Job type: </p><p><input type="radio" name="jobtype" value="Employment" checked> Employment   <input type="radio" name="jobtype" value="Training"> Training<br>    <input type="radio" name="jobtype" value="Internship"> Internship<br><input type="radio" name="jobtype" value="Master"> Master<br><input type="radio" name="jobtype" value="PhD"> PhD<br> </p>';
      $(inp).appendTo("#extraformfields");
    }
  });
  $(function () {
    var inp;
    $('input[name="typeedited"]').click(function (e) {
      if (e.target.value === 'event') {
        $("#extraeditformfields").empty();
        inp = '    <p>Event date: </p><input type="date" id="eventdateedited" name="eventdateedited" required><br>';
        $(inp).appendTo("#extraeditformfields");
      } else if (e.target.value === 'training') {
        $("#extraeditformfields").empty();
        inp = '    <p>Training date: </p><input type="date" id="eventdateedited" name="eventdateedited" required><br>';
        $(inp).appendTo("#extraeditformfields");
      } else if (e.target.value === 'job') {
        $("#extraeditformfields").empty();
        inp = '    <p>Job type: </p><p><input type="radio" name="jobtypeedited" value="Employment" checked> Employment   <input type="radio" name="jobtypeedited" value="Training"> Training<br>    <input type="radio" name="jobtypeedited" value="Internship"> Internship<br><input type="radio" name="jobtypeedited" value="Master"> Master<br><input type="radio" name="jobtypeedited" value="PhD"> PhD<br> </p>';
        $(inp).appendTo("#extraeditformfields");
      }
    });
  });
});
// $(function () {
//   isAdmin = parent.document.getElementsByClassName("bootstrapred");
//      if (isAdmin.length===0) {
//     $('#createbutton').hide();
//     $('#eventdelete').hide();
//     $('#eventedit').hide();
//   } else {
//     $('#createbutton').show();
//     $('#eventdelete').show();
//     $('#eventedit').show();
//   }
// });