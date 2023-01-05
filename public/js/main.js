// Task??: Delete Movies
// Using ajax to asynchronously update web pages. In this
// case when a movie gets deleted

// Wait for document to be ready
$(document).ready(function(){
    // Add listener for id
    $(".delete-movie").on("click", function(e){
        // Get id when button clicked
        $target = $(e.target);
        const id = $target.attr("data-id");
        // Send request to expresss with DELETE method
        $.ajax({
            type: "DELETE",
            url: "/movie/" + id,
            success: function(response){
                // Show movie deleted and redirect
                alert("Deleting Movie");
                window.location.href="/";
            },
            error: function(err){
                console.log(err);
            }
        })
    })
});
