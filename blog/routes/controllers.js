const express = require("express");
const router = express.Router();
const controllers = require("require.all")("../controllers");
var path = require("path");
const bodyparser = require('body-parser');
const multer = require('multer');

//use express static folder
router.use(express.static("./public"))
 
// body-parser middleware use
router.use(bodyparser.json())
router.use(bodyparser.urlencoded({
    extended: true
}))

var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
      callBack(null, './public/images/')     // './public/images/' directory name where save the file
  },
  filename: (req, file, callBack) => {
      callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({
  storage: storage
});

router
  .all("/:controller", (req, res, next) => {
    new controllers[req.params.controller]().index(req, res, next);
  })
  .all("/:controller/:action", upload.single('image'),(req, res, next) => {
    new controllers[req.params.controller]()[req.params.action](req, res, next);
  })
  .all("/:controller/:action/:id", (req, res, next) => {
    new controllers[req.params.controller]()[req.params.action](req, res, next);
  });

module.exports = router;
