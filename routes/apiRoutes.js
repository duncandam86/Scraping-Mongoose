const db = require("../models");

module.exports = function (app) {
    //Route to post saved Articles in db
    app.post("/api/saved", function (req, res) {
        db.Article.create(req.body)
            .then(function (dbArticle) {
                res.json(dbArticle)
            }).catch(function (err) {
                res.json(err)
            });
    });

    // Route for saving/updating an Article's associated Note
    app.post("/notes/:id", function (req, res) {
        db.Note.create(req.body)
            .then(function (dbNote) {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function (dbArticle) {
                console.log(dbArticle)
                res.json(dbArticle)
            }).catch(function (err) {
                res.json(err)
            })
    });
}