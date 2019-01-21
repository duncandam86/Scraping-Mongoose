//click button to save article 
$(document).on("click", ".save-article", function (event) {
  var thisId = $(this).attr("data-id")
  // console.log(thisId);
  $(this).hide();

  let data = {
    title: $("#title-" + thisId).text(),
    link: $("#link-" + thisId).text(),
    excerpt: $("#excerpt-" + thisId).text(),
    isSaved: true
  }
  // console.log(data)
  $.ajax({
    method: "POST",
    url: "/saved",
    data: data,
    dataType: "json"
  }).then(function () {
    // console.log("ajax call works")
  })
})
//delete article in saved article folder
$(document).on("click", ".delete-article", function () {
  var thisId = $(this).attr("data-id");
  console.log(thisId)
  $.ajax({
    method: "DELETE",
    url: "/saved/" + thisId
  })
    .then(data => {
      // Log the response
      // console.log(data);
      location.reload();
    });
});

//note propagate once click on note button in saved article
$(document).on("click", ".note-article", function () {
  // Empty the notes from the note section
  $(".modal-title").empty();
  $(".modal-body").empty()
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(data => {
      // console.log(data);
      // The title of the article
      $(".modal-title").append(data.title);
      // A textarea to add a new note body
      $(".modal-body").append("<div><textarea id='bodyinput' rows='6' name='body' style='min-width: 100%;'></textarea></div>");
      // Note saved
      // A button to submit a new note, with the id of the article saved to it
      $(".modal-footer").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-primary btn-sm' style='margin-top:20px;'data-dismiss='modal'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // console.log(data.note)
        for ( var i = 0; i < data.note.length; i++) {
          // console.log(data.note[i]._id)
          $(".modal-body").append("<li class= 'list-group-item'><p>" + data.note[i].body + "</p><button data-id='" + data.note[i]._id + "'class= 'delete-note btn btn-danger'>X</button></li>");
        }
        // Place the body of the note in the modal
      }
    });
});

//save note 
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(data => {
      // Log the response
      // console.log(data);
      // Empty the notes section
      $("#bodyinput").empty();
      $(".modal-footer").empty()
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#bodyinput").val("");
})

//save note 
$(document).on("click", ".delete-note", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  // console.log(thisId)
  // Run a DELETE
  $.ajax({
    method: "DELETE",
    url: "/articles/" + thisId,
  })
    // With that done
    .then(remove => {
      // console.log(remove);
      location.reload();
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#bodyinput").val("");
})
