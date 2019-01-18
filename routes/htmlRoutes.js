const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function (app) {
    // homepage route
    app.get("/", function (req, res) {
        res.render("index")
    });

    // A GET route for scraping the echoJS website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with axios
        axios.get("https://phys.org/nanotech-news/").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $("article h3").each(function (i, element) {
                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(element).children("a").text();
                result.link = $(element).children("a").attr("href");
                result.excerpt = $(element).parent().children("p").text().trim();

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
            });
            //collect all articles that was scraped and display in scrape page
            db.Article.find({ isSaved: false })
                .then(function (dbArticle) {
                    // console.log(dbArticle)
                    res.render("scrape", { article: dbArticle });
                })
                .catch(function (err) {
                    res.json(err)
                })
        });
    });

    // Route for getting all Articles from the db
    app.get("/saved", function (req, res) {
        // TODO: Finish the route so it grabs all of the articles
        db.Article.find({ isSaved: true })
            .then(function (dbArticle) {
                // console.log(dbArticle)
                res.render("saved", { savedArticle: dbArticle });
            })
            .catch(function (err) {
                res.json(err)
            })
    });

    //Route to delete saved Article from db
    app.delete("/saved/:id", function (req, res) {
        db.Article.deleteOne({ _id: req.params.id })
            .then(function (removed) {
                res.json(removed);
            }).catch(function (err, removed) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/notes/:id", function (req, res) {
        db.Article.findOne({ _id: req.params.id })
            .populate("notes")
            .then(function (dbArticle) {
                res.json(dbArticle)
            }).catch(function (err) {
                res.json(err)
            })
    });

    // Route for deleting note 
    app.delete("/notes/:id", function (req, res) {
        db.Note.deleteOne({ _id: req.params.id })
            .then(function (remove) {
                res.json(remove)
            }).catch(function (err) {
                res.json(err)
            })
    });
}