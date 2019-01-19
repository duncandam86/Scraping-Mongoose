//click button to save article 
$(document).on("click", ".save-article", () => {
  const thisId = $(this).attr("data-id")
  console.log(thisId)
  $(this).hide();
  let data = {
    title: $("#title-"+thisId).text(),
    link: $("#link-"+thisId).text(),
    excerpt: $("#excerpt-"+thisId).text(),
    isSaved: true
  }

  console.log(data)
  $.ajax({
    method: "POST",
    url: "/api/saved",
    data: data,
    dataType: "json"
  })
})

//delete article in saved article folder
$(document).on("click", ".delete-article", () => {
  const thisId = $(this).attr("data-id");
  console.log(thisId)
  $.ajax({
    method: "DELETE",
    url: "/saved/" + thisId
  })
  .then(data => {
    // Log the response
    console.log(data);
    location.reload();
  });
});

//note propagate once click on note button in saved article