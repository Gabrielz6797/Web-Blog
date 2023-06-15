var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/posts");
});

router.get("/users", function (req, res, next) {
  res.redirect("/posts");
});

router.get("/posts/view", function (req, res, next) {
  res.redirect("/posts");
});

router.get("/posts/author", function (req, res, next) {
  res.redirect("/posts");
});

router.get("/posts/category", function (req, res, next) {
  res.redirect("/posts");
});

module.exports = router;
