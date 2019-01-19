const db = require("../models");

module.exports = function (app) {
    //Route to post saved Articles in db
    app.post("/api/saved", (req, res) => {
        db.Article.create(req.body)
            .then(dbArticle => {
                res.json(dbArticle)
            }).catch(err => {
                res.json(err)
            });
    });

    // Route for saving/updating an Article's associated Note
    app.post("/notes/:id", (req, res) => {
        db.Note.create(req.body)
            .then(dbNote => {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(dbArticle => {
                console.log(dbArticle);
                res.json(dbArticle)
            }).catch(err => {
                res.json(err)
            })
    });
}