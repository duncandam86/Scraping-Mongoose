const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars")
const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

//configure middleware

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");


// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/nanotechnews";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

// Start the server
app.listen(PORT, () => {
  console.log("App running on port " + PORT + "!");
});
