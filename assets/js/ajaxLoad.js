$(document).ready(function() {
    //This is set to 2 since the posts already loaded should be page 1
    nextPage = 2;
    //Set this to match the pagination used in your blog
    pagination = 1;

    //on button click
    $('#load-posts').click(function() {
        $.ajax({
            //go grab the pagination number of posts on the next page and include the tags
            url: ghost.url.api("posts") + '&include=tags&limit=' + pagination + '&page=' + nextPage,
            type: 'get'
        }).done(function(data) {
            //for each post returned
            $.each(data.posts, function(i, post) {
                //Take the author of the post, and now go get that data to fill in
                $.ajax({
                    url: ghost.url.api("users") + '&filter=id:' + post.author,
                    type: 'get'
                }).done(function(data) {
                    $.each(data.users, function(i, users) {
                        //Now that we have the author and post data, send that to the insertPost function
                        insertPost(post, users);
                    });
                });
            });
        }).done(function(data) {
            //If you are on the last post, hide the load more button
            if (nextPage == data.meta.pagination.total) {
                $('#load-posts').hide();
            }
        }).fail(function(err) {
            console.log(err);
        });
    })

    function insertPost(postData, authorData) {
        //start the inserting of the html
        var postInfo = '<article class="post">\
                <header class="post-header">\
                    <h2 class="post-title"><a href="' + postData.url + '">' + postData.title + '</a></h2>\
                </header>\
                <section class="post-excerpt">\
                    <p>' + postData.html + '<a class="read-more" href="' + postData.url + '">& raquo; < /a></p > \
            < /section>\ < footer class = "post-meta" > '

        //if no author image, dont include it
        if (authorData.Image != null) {
            postInfo += '<img class="author-thumb" src="' + authorData.image + '" alt="' + authorData.name + '" nopin="nopin" />'
        }

        //if there are tags, add each of them to the post
        if (postData.tags.length > 0) {
            for (i = 0; i < postData.tags.length; i++) {
                console.log(postData.tags[i]);
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
        //incriment next page so it will get the next page of posts if hit again.
        nextPage += 1;
    }
});
