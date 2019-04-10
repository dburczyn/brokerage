// update json advert list

// call list api
// name: "test job name"
// sha: "test sha"

// for each form list api
// call specific api, make json array

// [
// {
// name:
// adverttype:
// date:
// jobtype:
// createdat:
// updatedat:
// },
// {},
// ...
// ]




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var repourl = "https://api.github.com/repositories/175385549/contents/js";
var authorizationtoken ="fc0c4dab97342a2989433144eaa368ce19633982";


$(function () {
    $.ajax({
      url: repourl,
      beforeSend: function (request) {
        if (typeof authorizationtoken !== 'undefined') {
          request.setRequestHeader("Authorization", "token " + authorizationtoken);
        }
      },
      dataType: 'json',
      success: function (results) {
        resultsJSON = [];
        $.each(results, function (i, f) {
            console.log(i);
            resultsJSON.push({
                            name: f.name,
                            });
        resultsJSON.forEach(function (entry) {
            $.ajax({
                url: repourl + '/' + entry.name,
                beforeSend: function (request) {
                  if (typeof authorizationtoken !== 'undefined') {
                    request.setRequestHeader("Authorization", "token " + authorizationtoken);
                  }
                },
                dataType: 'json',
                success: function (response) {
c
                }
              });
        });
      }
    });
  });
