const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");

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
                let result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(element).children("h3").children("a").text();
                // console.log($(element).children("h3 a"))
                result.link = $(element).children("h3").children("a").attr("href");
                result.excerpt = $(element).children(".news-box-text").children("p").text().trim();

                console.log(result)

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(dbArticle => {
                        // View the added result in the console
                        // console.log(dbArticle);
                    })
                    .catch(err => {
                        // If an error occurred, log it
                        // console.log(err);
                    });

            });

        });
        //collect all articles that was scraped and display in scrape page
        db.Article.find({})
            .then(dbArticle => {
                // console.log(dbArticle)
                res.render("scrape", { article: dbArticle });
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