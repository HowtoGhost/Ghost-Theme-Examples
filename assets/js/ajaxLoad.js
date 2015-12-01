$(document).ready(function() {
    //Grab api url, this is just checking to see if there is a port in the url
    if (window.location.port == "") {
        var baseUrl = ghost.url
        var apiUrl = ghost.url.api();
    } else {
        var baseUrl = ghost.url
        var apiUrl =  ghost.url.api()
    }

    //grab client id and secret
    var clientId = $('[property="ghost:client_id"]').attr('content'),
        clientSecret = $('[property="ghost:client_secret"]').attr('content'),
        //set pagination to be the number of posts you wish to load
        pagination = 2;
        
    //Set the current page based on what is in the url
    var currentPage = location.href.split("page=")[1];

    //If no values, set it to one
    if (typeof(currentPage) == "undefined") {
        currentPage = 1;
    }

    //Start loading all the posts for the current page
    $.ajax({
        //go grab the pagination number of posts on the current page and include the tags
        url: apiUrl + 'posts/?include=tags&limit=' + pagination + '&page=' + currentPage + '&client_id=' + clientId + '&client_secret=' + clientSecret,
        type: 'get'
    }).done(function(data) {
        //if there are no more pages, disable next post button
        if (data.meta.pagination.next == null) {
            $('#next-posts').attr('disabled', 'disabled');
        } else {
            //If there are more pages, link to the next one
            $('#next-posts a').attr('href', baseUrl + '?page=' + data.meta.pagination.next);
        }

        //If there is a previous page
        if (data.meta.pagination.prev !== null) {
            //Enable the button
            $('#prev-posts').removeAttr('disabled'); 

            //If the previous page is 1, then just remove all the variables, if not, just step down one
            if (data.meta.pagination.prev == 1) {
                $('#prev-posts a').attr('href', baseUrl);
            } else {
                $('#prev-posts a').attr('href', baseUrl + '?page=' + data.meta.pagination.prev);
            }
            
        }

        //for each post returned
        $.each(data.posts, function(i, post) {
            //Take the author of the post, and now go get that data to fill in
            $.ajax({
                url: apiUrl + 'users/?filter=id:' + post.author + '&client_id=' + clientId + '&client_secret=' + clientSecret,
                type: 'get'
            }).done(function(data) {
                $.each(data.users, function(i, users) {
                    //Now that we have the author and post data, send that to the insertPost function
                    insertPost(post, users);
                });
            });
        });
    }).fail(function(err) {
        console.log(err);
    });

    function insertPost(postData, authorData) {
        //start the inserting of the html
        var postInfo = '<article class="post">\
                <header class="post-header">\
                    <h2 class="post-title"><a href="' + postData.url + '">' + postData.title + '</a></h2>\
                </header>\
                <section class="post-excerpt">\
                    <p>' + postData.markdown + '<a class="read-more" href="' + postData.url + '">&raquo;</a></p>\
                </section>\
                <footer class="post-meta">'

        //if no author image, dont include it
        if (authorData.Image != null) {
            postInfo += '<img class="author-thumb" src="' + authorData.image + '" alt="' + authorData.name + '" nopin="nopin" />'
        }

        //if there are tags, add each of them to the post
        if (postData.tags.length > 0) {
            for (i = 0; i < postData.tags.length; i++) {
                postInfo += authorData.name + ' on ' + '<a href="/tag/' + postData.tags[i].slug + '">' + postData.tags[i].name + "</a> ";
            }
        } else {
            //if no tags, just add the author name
            postInfo += authorData.name;
        }

        //Finish off the html with the time
        //The format for the time will be different, you will have to figure this out
        postInfo += '<time class="post-date" datetime="' + postData.published_at + '">' + postData.published_at + '</time>\
                </footer>\
            </article>'

        //Append the html to the content of the blog
        $('#content').append(postInfo);
    }
});