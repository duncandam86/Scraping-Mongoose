const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

module.exports = function (app) {
    // homepage route
    app.get("/", function (req, res) {
        res.render("index")
    });

    // A GET route for scraping the echoJS website
    app.get("/scrape", (req, res) => {
        // First, we grab the body of the html with axios
        axios.get("https://phys.org/nanotech-news/").then(response => {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            const $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $("article.news-box").each((i, element) => {
                // Save an empty result object


                // Add the text and href of every link, and save them as properties of the result object
                let title = $(element).children("h3").children("a").text();
                // console.log($(element).children("h3 a"))
                let link = $(element).children("h3").children("a").attr("href");
                let excerpt = $(element).children(".news-box-text").children("p").text().trim();
                let articleCreated = moment().format("YYYY MM DD hh:mm:ss");

                let result = {
                    title: title,
                    link: link,
                    excerpt: excerpt,
                    articleCreated: articleCreated,
                    isSaved: false
                };

                // console.log(result)

                //collect all articles that was scraped and display in scrape page
                db.Article.findOne({title:title})
                    .then(function (data) {
                        // console.log(data);
                        if (data === null) {
                            db.Article.create(result)
                                .then(function (dbArticle) {
                                    res.json(dbArticle)
                                });
                        }
                    }).catch(function (err) {
                        res.json(err)
                    })
            });

        });
        db.Article.find({ isSaved: false }).sort({articleCreated: -1})
            .then(dbArticle => {
                res.render("scrape", { article: dbArticle })
            })
            .catch(err => {
                res.json(err)
            })

    });

    // Route for getting all Articles from the db
    app.get("/saved", (req, res) => {
        // TODO: Finish the route so it grabs all of the articles
        db.Article.find({ isSaved: true })
            .then(dbArticle => {
                // console.log(dbArticle)
                res.render("saved", { savedArticle: dbArticle });
            })
            .catch(err => {
                res.json(err)
            })
    });

    //Route to delete saved Article from db
    app.delete("/saved/:id", (req, res) => {
        db.Article.deleteOne({ _id: req.params.id })
            .then(removed => {
                res.json(removed);
            }).catch((err, removed) => {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/notes/:id", (req, res) => {
        db.Article.findOne({ _id: req.params.id })
            .populate("notes")
            .then(dbArticle => {
                res.json(dbArticle)
            }).catch(err => {
                res.json(err)
            })
    });

    // Route for deleting note 
    app.delete("/notes/:id", (req, res) => {
        db.Note.deleteOne({ _id: req.params.id })
            .then(remove => {
                res.json(remove)
            }).catch(err => {
                res.json(err)
            })
    });
}