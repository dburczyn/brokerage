// provided by Olive, just here for testing
repourl = "https://api.github.com/repositories/175385549/contents/js";
authorizationtoken = "";
function setAuthHeader(request) {
  if (typeof authorizationtoken !== 'undefined') {
    request.setRequestHeader("Authorization", "token " + authorizationtoken);
  }
}
// config  for date parser
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
// array diff function declaration to create rich list of files
Array.prototype.diff = function (a) {
  return this.filter(function (i) {
    return a.indexOf(i) < 0;
  });
};
// Olive Admin control - get repo url and authentication token if you are admin
// $(function () {
//   repourl = parent.document.getElementById("brokerrepourl").value;
//   $('#createbutton').hide();
//   $('#eventdelete').hide();
//   $('#eventedit').hide();
//   authorizationelement = parent.document.getElementById("brokerageauth");
//   if (authorizationelement != null) {
//     authorizationtoken = parent.document.getElementById("brokerageauth").value;
//     $('#createbutton').show();
//     $('#eventdelete').show();
//     $('#eventedit').show();
//   }
// });
indexlistendpoint = 'indexlist';
names = [];
indexedListNames = [];
indexListobjToUpdate = {};
indexListobjToUpdate.list = [];
$(function () {
  $('#getevents').on('click', function (e) {
    // clear widget llist container
    $("#foo").empty();
    // call endpoint returning "rich list of widged instances" - with all data needed to produce tiles in grid widget view
    $.ajax({
      url: repourl + '/' + indexlistendpoint,
      beforeSend: setAuthHeader,
      dataType: 'json',
      success: function (response) {
        // produce array with info needed to produce tile for each widget instance
        resultsJSON = [];
        listsha = response.sha;
        unencodedcontent = JSON.parse(atob(response.content));
        $.each(unencodedcontent.list, function (i, f) {
          if (f.name !== indexlistendpoint) { // omit indexlist file - it is in the same repo folder
            resultsJSON.push({
              updatedat: f.updatedat,
              createdat: f.createdat,
              datetype: f.datetype,
              name: f.name,
              type: f.type
            });
            if (typeof f.updatedat !== 'undefined') {
              indexedListNames.push(
                f.updatedat
              );
            }
          }
        });
        // filter/sort results based on user input
        if (document.getElementById('nameasc').checked) {
          resultsJSON.sort(function (a, b) {
            return ('' + a.name).localeCompare(b.name);
          });
        } else if (document.getElementById('namedesc').checked) {
          resultsJSON.sort(function (a, b) {
            return -('' + a.name).localeCompare(b.name);
          });
        } else if (document.getElementById('createdasc').checked) {
          resultsJSON.sort(function (a, b) {
            return ('' + a.createdat).localeCompare(b.createdat);
          });
        } else if (document.getElementById('createddesc').checked) {
          resultsJSON.sort(function (a, b) {
            return -('' + a.createdat).localeCompare(b.createdat);
          });
        } else if (document.getElementById('updtedasc').checked) {
          resultsJSON.sort(function (a, b) {
            return ('' + a.updatedat).localeCompare(b.updatedat);
          });
        } else if (document.getElementById('updteddesc').checked) {
          resultsJSON.sort(function (a, b) {
            return -('' + a.updatedat).localeCompare(b.updatedat);
          });
        }
        function isJob(value) {
          if (value.type === "job") {
            return value;
          }
        }
        function isEvent(value) {
          if (value.type === "event") {
            return value;
          }
        }
        function isTraining(value) {
          if (value.type === "training") {
            return value;
          }
        }
        if (document.getElementById('showjobs').checked) {
          resultsJSON = resultsJSON.filter(isJob);
        } else if (document.getElementById('showevents').checked) {
          resultsJSON = resultsJSON.filter(isEvent);
        } else if (document.getElementById('showtrainings').checked) {
          resultsJSON = resultsJSON.filter(isTraining);
        }
        // produce tiles based on type/sorting/filtering
        resultsJSON.forEach(function (entry) {
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
          var list = '<div class="col-md-3 cms-boxes-outer">                <div class="cms-boxes-items cms-features" style="background-color:' + bgcolor + '">                  <div class="boxes-align" data-toggle="modal" data-target="#expandedTile" id="' + entry.updatedat + '">                    <div class="small-box">             <br>         ' + icon + '                       <h3>' + entry.name + '</h3><h4>' + handle + entry.datetype + '</h4><h5>Last update: ' + parsedupdatedat + '</h5><h5> Created: ' + parsedcreatedat + '</h5>                    </div>                  </div>                </div>              </div>  ';
          // append every tile to main grid container
          $(list).appendTo("#foo");
        });
        getListOfObjects();
      }
    }).fail(function (request) { // handler for github-related api calls limit error
      if (request.getResponseHeader('X-RateLimit-Remaining') == 0) {
        var resetmilis = request.getResponseHeader('X-RateLimit-Reset');
        var resetdate = new Date(resetmilis * 1000);
        alert("You have exceeded your limit of api calls, your limit will be refreshed: " + resetdate);
      }
    });
    // call specific widget endpoint if a widget tile is clicked
    $('.container-fluid').on('click', '.boxes-align', function (e) {
      e.stopPropagation();
      $.ajax({
          url: repourl + '/' + $(this).attr('id'),
          beforeSend: setAuthHeader,
          dataType: 'json',
          success: function (response) {
            // populate details modal and show it to user
            currentresponse = response;
            content = atob(response.content);
            unencodedcontent = JSON.parse(content);
            document.getElementById('modal-title').innerHTML = unencodedcontent.name;
            document.getElementById('datetype').innerHTML = unencodedcontent.datetype;
            document.getElementById('dateofcreate').innerHTML = new Date(parseInt(unencodedcontent.createdat)).toLocaleDateString(locale, options);
            document.getElementById('dateofupdate').innerHTML = new Date(parseInt(unencodedcontent.updatedat)).toLocaleDateString(locale, options);
            document.getElementById('currentPhoto').src = unencodedcontent.picture;
            document.getElementById('mailbutton').href = 'mailto:' + unencodedcontent.email;
            document.getElementById('description').innerHTML = unencodedcontent.description;
            $('#expandedTile').modal('show');
          }
        })
        .fail(function () {
          alert('That entry is no longer avaliable'); // in case entry is not reachable
        });
    });
  });
  // load all usorted/unfiltered widgets on page load
  $("#getevents").trigger("click");
  // handle submission of new event
  $('#event_create_form').on('submit', function (e) {
    e.preventDefault();
    // get event type from radio button
    var typesradio = document.getElementsByName('type');
    var type;
    for (var i = 0, length = typesradio.length; i < length; i++) {
      if (typesradio[i].checked) {
        type = typesradio[i].value;
        break;
      }
    }
    // if type is event or training, read date field, if it is job, read job type field
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
    // produce content of widget instance
    var content = {};
    content.description = $('#filecontent').val();
    content.picture = $('#eventpicture').val();
    content.email = $('#emailaddress').val();
    content.updatedat = $('#createdat').val();
    content.createdat = $('#createdat').val();
    content.datetype = handler;
    content.type = type;
    content.name = $('#filename').val();
    // create file storing content with api call
    $.ajax({
      url: repourl + '/' + $('#createdat').val(), // creation date acts as unique id (file name in repo)
      beforeSend: setAuthHeader,
      type: 'PUT',
      data: '{"message": "create file","content":"' + btoa(JSON.stringify(content)) + '" }',
      success: function (data) {
        $('#createform').modal('hide');
      }
    });
  });
  // handle deletion of widget instance
  $('#eventdelete').on('click', function (e) {
    e.preventDefault();
    var action = confirm('Are you sure you wish to delete this item ? It cannot be undone!');
    if (action === false) {
      return false;
    }
    $.ajax({
      // id/file name is known and set in currentrespopnse.name, when widget content is shown
      url: repourl + '/' + currentresponse.name,
      beforeSend: setAuthHeader,
      type: 'DELETE',
      //sha is known when widget content is shown (after specific widget api call)
      data: '{"message": "delete file","sha":"' + currentresponse.sha + '" }',
      success: function (data) {
        // hide widget details modal after deletion (since source is no longer in repo)
        $('#expandedTile').modal('hide');
      }
    });
  });
  // handle edit form preparation
  $('#eventedit').on('click', function (e) {
    // populate form with static fields
    updatedat = new Date().getTime();
    e.preventDefault();
    document.getElementById("updatedatedited").value = updatedat;
    document.getElementById("createdatedited").value = unencodedcontent.createdat;
    document.getElementById("filenameedited").value = unencodedcontent.name;
    document.getElementById("filecontentedited").value = unencodedcontent.description;
    document.getElementById("emailaddressedited").value = unencodedcontent.email;
    document.getElementById("eventpictureedited").value = unencodedcontent.picture;
    var typesradionew = document.getElementsByName('typeedited');
    var jobtypeedited;
    for (var i = 0, length = typesradionew.length; i < length; i++) {
      if (unencodedcontent.type === typesradionew[i].value) {
        typesradionew[i].checked = true;
        jobtypeedited = typesradionew[i].value;
        break;
      }
    }
    // create additional input fields dynamically, based on type
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
      inp = '    <p>Job type: </p><p><input type="radio" name="jobtypeedited" value="Employment" checked> Employment<br>   <input type="radio" name="jobtypeedited" value="Training"> Training<br>    <input type="radio" name="jobtypeedited" value="Internship"> Internship<br><input type="radio" name="jobtypeedited" value="Master"> Master<br><input type="radio" name="jobtypeedited" value="PhD"> PhD<br> </p>';
      $(inp).appendTo("#extraeditformfields");
    }
    // populate additional input fields, based on type
    if (jobtypeedited === 'event' || jobtypeedited === 'training') {
      document.getElementById("eventdateedited").value = unencodedcontent.datetype;
    } else if (jobtypeedited === 'job') {
      var typeseditedradionew = document.getElementsByName('jobtypeedited');
      for (var j = 0, l = typeseditedradionew.length; j < l; j++) {
        if (unencodedcontent.datetype === typeseditedradionew[j].value) {
          typeseditedradionew[j].checked = true;
          break;
        }
      }
    }
  });
  // clear create form on 'new' button click
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
  // handle submission of edit form
  $('#file_edit_form').on('submit', function (e) {
    e.preventDefault();
    // set edited type
    var typesradioedited = document.getElementsByName('typeedited');
    var typeedited;
    for (var i = 0, length = typesradioedited.length; i < length; i++) {
      if (typesradioedited[i].checked) {
        typeedited = typesradioedited[i].value;
        break;
      }
    }
    // set edited jobtype for job, datee for event/training
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
    // create content based on edit form inputs
    var contentedited = {};
    contentedited.description = $('#filecontentedited').val();
    contentedited.picture = $('#eventpictureedited').val();
    contentedited.email = $('#emailaddressedited').val();
    contentedited.updatedat = $('#updatedatedited').val();
    contentedited.createdat = $('#createdatedited').val();
    contentedited.datetype = handler;
    contentedited.type = typeedited;
    contentedited.name = $('#filenameedited').val();
    //call create endpoint
    $.ajax({
      url: repourl + '/' + $('#updatedatedited').val(), // update date becomes new id
      beforeSend: setAuthHeader,
      type: 'PUT',
      data: '{"message": "edit file","content":"' + btoa(JSON.stringify(contentedited)) + '"}',
    }).done(function (data) {
      // delete old file after creation of new one
      $.ajax({
        url: repourl + '/' + currentresponse.name,
        beforeSend: setAuthHeader,
        type: 'DELETE',
        data: '{"message": "delete file","sha":"' + currentresponse.sha + '" }',
        success: function (data) {
          $('#expandedTile').modal('hide');
        }
      });
      // hide modal after operation
      $('#editform').modal('hide');
    });
  });
  var inp;
  // create additional input fields, when uset clicked widget type in edit form
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
      inp = '    <p>Job type: </p><p><input type="radio" name="jobtypeedited" value="Employment" checked> Employment <br>  <input type="radio" name="jobtypeedited" value="Training"> Training<br>    <input type="radio" name="jobtypeedited" value="Internship"> Internship<br><input type="radio" name="jobtypeedited" value="Master"> Master<br><input type="radio" name="jobtypeedited" value="PhD"> PhD<br> </p>';
      $(inp).appendTo("#extraeditformfields");
    }
  });
  // create additional input fields, when uset clicked widget type in create form
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
      inp = '    <p>Job type: </p><p><input type="radio" name="jobtype" value="Employment" checked> Employment<br>   <input type="radio" name="jobtype" value="Training"> Training<br>    <input type="radio" name="jobtype" value="Internship"> Internship<br><input type="radio" name="jobtype" value="Master"> Master<br><input type="radio" name="jobtype" value="PhD"> PhD<br> </p>';
      $(inp).appendTo("#extraformfields");
    }
  });
});
// get list of names
function getListOfObjects() {
  $.ajax({
    url: repourl,
    beforeSend: setAuthHeader,
    dataType: 'json',
    success: function (results) {
      $.each(results, function (i, f) {
        if (f.name != indexlistendpoint) {
          names.push(
            f.name
          );
        }
      });
      getDiffIndexList(); // after having list of all names in repo, get list of indexed names
    }
  });
}
// if no name on indexlist add object to indexlist
function getDiffIndexList() {
  namesToAddToList = names.diff(indexedListNames);
  var promises = [];
  namesToAddToList.forEach(function (entry, f) {
    var request = $.ajax({
      url: repourl + '/' + entry,
      beforeSend: setAuthHeader,
      dataType: 'json',
      success: function (response) {
        currentresponse = response;
        content = atob(response.content);
        unencodedcontentdiff = JSON.parse(content);
        indexListobjToUpdate.list.push({
          createdat: unencodedcontentdiff.createdat,
          updatedat: unencodedcontentdiff.updatedat,
          datetype: unencodedcontentdiff.datetype,
          name: unencodedcontentdiff.name,
          type: unencodedcontentdiff.type
        });
      }
    });
    promises.push(request);
  });
  $.when.apply(null, promises).done(function () {
    performUpdate();
  });
}
function performUpdate() {
  namesToDeleteFromList = indexedListNames.diff(names);
  result = {}
  result.list = unencodedcontent.list.concat(indexListobjToUpdate.list);
  for (var j = 0; j < namesToDeleteFromList.length; j++) {
    for (var i = 0; i < result.list.length; i++) {
      if (result.list[i].updatedat == namesToDeleteFromList[j]) {
        result.list.splice(i, 1);
      }
    }
  }
  $.ajax({
    url: repourl + '/' + indexlistendpoint,
    beforeSend: setAuthHeader,
    type: 'PUT',
    data: '{"message": "create indexlist","sha":"' + listsha + '","content":"' + btoa(JSON.stringify(result)) + '" }',
    dataType: 'json',
  });
}