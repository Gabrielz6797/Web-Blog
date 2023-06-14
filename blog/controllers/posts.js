const Post = require("../models").Post;

class PostController {
  async index(req, res, next) {
    const posts = await Post.findAll({ order: [["createdAt", "DESC"]] });
    let postCount  = Object.keys(posts).length;
    let flashMessage = undefined;
    if (req.session.flashMessage) {
      flashMessage = req.session.flashMessage;
      req.session.flashMessage = undefined;
    }
    let page = 1;
    if (req.query.page) {
      try {
        page = parseInt(req.query.page);
      } catch (error) {
        console.error(error);
      }
    }
    req.session.page = page
    let limit = 5;
    let pageNumber = Math.ceil(postCount / limit);
    // calculating the starting and ending index
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    if (endIndex < posts.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    let paginatedPosts = posts.slice(startIndex, endIndex);
    res.render("posts/index", {
      title: "Diario web",
      posts: paginatedPosts,
      user: req.session,
      page: page,
      pageNumber: pageNumber,
      flashMessage: flashMessage,
    });
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
      res.render("posts/create", {
        title: "Crear publicación",
        user: req.session,
      });
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
      res.render("posts/update", {
        title: "Editar publicación",
        post: post,
        user: req.session,
      });
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
