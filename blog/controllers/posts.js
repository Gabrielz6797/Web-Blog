const Post = require("../models").Post;

class PostController {
  async index(req, res, next) {
    const posts = await Post.findAll();
    if (req.session.flashMessage) {
      let flashMessage = req.session.flashMessage;
      req.session.flashMessage = undefined;
      res.render("posts/index", {
        title: "Diario web",
        posts: posts,
        user: req.session,
        flashMessage: flashMessage,
      });
    } else {
      console.log("");
      console.log("User:");
      console.log("userName: " + req.session.userName);
      console.log("name: " + req.session.name);
      console.log("email: " + req.session.email);
      console.log("admin: " + req.session.admin);
      console.log("");
      res.render("posts/index", {
        title: "Diario web",
        posts: posts,
        user: req.session,
      });
    }
  }

  async create(req, res, next) {
    if (req.method === "POST") {
      await Post.create({
        title: req.body.title,
        date: Date(),
        image: req.body.image,
        summary: req.body.summary,
        author: req.session.name,
      });
      res.redirect("/posts");
    } else {
      res.render("posts/create", { title: "Crear publicación" });
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
      res.render("posts/update", { title: "Editar publicación", post: post });
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
    const post = await Post.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.render("posts/view", {
      title: 'Información de la publicación "' + post.title + '"',
      post: post,
      user: req.session,
    });
  }

  async author(req, res, next) {
    console.log("autor: " + req.params.id);
    const posts = await Post.findAll({
      where: {
        author: req.params.id,
      },
    });
    res.render("posts/author", {
      title: 'Publicaciones del autor "' + req.params.id + '"',
      posts: posts,
      user: req.session,
    });
  }
}

module.exports = PostController;
