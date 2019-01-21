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

                // Add the text and href of every link, and save them as properties of the result object
                let title = $(element).children("h3").children("a").text();
                // console.log($(element).children("h3 a"))
                let link = $(element).children("h3").children("a").attr("href");
                let excerpt = $(element).children(".news-box-text").children("p").text().trim();
                let articleCreated = moment().format("YYYY MM DD hh:mm:ss");

                // Save an empty all fields in result object
                let result = {
                    title: title,
                    link: link,
                    excerpt: excerpt,
                    articleCreated: articleCreated,
                    isSaved: false
                };

                // console.log(result)

                //collect all articles and find the one with title
                db.Article.findOne({ title: title })
                    .then(data => {
                        // console.log(data);
                        if (data === null) {
                            //if there are articles, put it in the db
                            db.Article.create(result)
                                .then(function (dbArticle) {
                                    res.json(dbArticle)
                                });
                        }
                    }).catch(err => {
                        res.json(err)
                    })
            });

        });
        //put all found articles on DOM
        db.Article.find({ isSaved: false }).sort({ articleCreated: -1 })
            .then(dbArticle => {
                //rendering on scrape page
                res.render("scrape", { article: dbArticle })
            })
            .catch(err => {
                res.json(err)
            })

    });
    //Route to post saved Articles in db
    app.post("/saved", (req, res) => {
        db.Article.create(req.body)
            .then(dbArticle => {
                res.json(dbArticle)
            }).catch(err => {
                res.json(err)
            });
    });

    // Route for getting all saved Articles from db and render it on saved page
    app.get("/saved", (req, res) => {
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
            }).catch(err => {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });


    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", (req, res) => {
        db.Article.findOne({ _id: req.params.id })
            .populate("note")
            .then(dbArticle => {
                res.json(dbArticle)
            }).catch(err => {
                res.json(err)
            })
    });


    //Route to post notes in db
    app.post("/articles/:id", (req, res) => {
        db.Note.create(req.body)
            .then(dbNote => {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
            })
            .then(dbArticle => {
                console.log(dbArticle);
                res.json(dbArticle)
            }).catch(err => {
                res.json(err)
            })
    });


    // Route for deleting article and its associated notes 
    app.delete("/articles/:id", (req, res) => {
        db.Note.deleteOne({ _id: req.params.id })
            .then(remove => {
                res.json(remove)
            }).catch(err => {
                res.json(err)
            })
    });
}