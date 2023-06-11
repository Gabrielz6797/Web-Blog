const Post = require("../models").Post;

class PostController {
  async index(req, res, next) {
    const posts = await Post.findAll();
    if (req.session.flashMessage) {
      res.render("posts/index", {
        title: "Weblog",
        posts: posts,
        flashMessage: req.session.flashMessage,
      });
    } else {
      console.log(req.session.userName);
      console.log(req.session.name);
      console.log(req.session.email);
      res.render("posts/index", { title: "Weblog", posts: posts });
    }
  }

  async create(req, res, next) {
    if (req.method === "POST") {
      await Post.create({
        title: req.body.title,
        date: Date(),
        image: req.body.image,
        summary: req.body.summary,
        author: req.body.author,
      });
      res.redirect("/posts");
    } else {
      res.render("posts/create", { title: "Weblog, crear" });
    }
  }

  async update(req, res, next) {
    if (req.method === "POST") {
      await Post.update(
        {
          title: req.body.title,
          date: Date(),
          image: req.body.image,
          summary: req.body.summary,
          author: req.body.author,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );
      res.redirect("/posts");
    } else {
      const post = await Post.findOne({
        where: {
          id: req.params.id,
        },
      });
      res.render("posts/update", { title: "Weblog, editar", post: post });
    }
  }

  async delete(req, res, next) {
    await Post.destroy({
      where: {
        id: req.params.id,
      },
    });
    req.session.flashMessage = "Se eliminó la publicación";
    res.redirect("/posts");
  }

  async view(req, res, next) {
    const posts = await Post.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.render("posts/view", { title: "Weblog", posts: posts });
  }

  async author(req, res, next) {
    console.log("autor: " + req.params.id);
    const posts = await Post.findAll({
      where: {
        author: req.params.id,
      },
    });
    res.render("posts/author", { title: "Weblog", posts: posts });
  }
}

module.exports = PostController;
