const Post = require("../models").Post;
const Category = require("../models").Category;
const User = require("../models").User;
const Comment = require("../models").Comment;
const sequelize = require("sequelize");

class PostController {
  async index(req, res, next) {
    const posts = await Post.findAll({ order: [["createdAt", "DESC"]] });
    const authors = await Post.findAll({
      attributes: ["author"],
      group: ["author"],
      order: [["author", "ASC"]],
    });
    const categories = await Category.findAll({
      attributes: ["name"],
      group: ["name"],
      order: [["name", "ASC"]],
    });
  //   const comments = await Comment.findAll({
  //     attribute: ['postId', [sequelize.fn("COUNT", sequelize.col('posts.id')), "count"]],
  //     include: [
  //         {
  //             model: Post,
  //             attributes: []
  //         }
  //     ],
  //     group: ['id']
  // })
  //   console.log(comments);
    let postCount = Object.keys(posts).length;
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
    req.session.page = page;
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
      authors: authors,
      categories: categories,
      user: req.session,
      page: page,
      pageNumber: pageNumber,
      flashMessage: flashMessage,
    });
  }

  async create(req, res, next) {
    if (req.method === "POST") {
      if (!req.file) {
        console.log("No file upload");
      } else {
        console.log("Filename: "+ req.file.filename)
        var imgsrc = 'http://127.0.0.1/images/' + req.file.filename
      }
      await Post.create({
        title: req.body.title,
        date: Date(),
        image: imgsrc,
        summary: req.body.summary,
        author: req.session.name,
        category: req.body.category,
      });
      res.redirect("/posts");
    } else {
      const categories = await Category.findAll({
        attributes: ["name"],
        group: ["name"],
        order: [["name", "ASC"]],
      });
      res.render("posts/create", {
        title: "Crear publicación",
        categories: categories,
        user: req.session,
      });
    }
  }

  async update(req, res, next) {
    if (req.method === "POST") {
      if (!req.file) {
        console.log("No file upload");
      } else {
        console.log("Filename: "+ req.file.filename)
        var imgsrc = 'http://127.0.0.1/images/' + req.file.filename
      }
      await Post.update(
        {
          title: req.body.title,
          date: Date(),
          image: imgsrc,
          summary: req.body.summary,
          author: req.body.author,
          category: req.body.category,
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
      const categories = await Category.findAll({
        attributes: ["name"],
        group: ["name"],
        order: [["name", "ASC"]],
      });
      res.render("posts/update", {
        title: "Editar publicación",
        post: post,
        categories: categories,
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
    if (req.method === "POST") {
      await Comment.create({
        comment: req.body.comment,
        postId: req.body.postId,
        date: Date(),
        email: req.body.email,
      });
      res.redirect("/posts/view/" + req.body.postId);
    } else {
      const post = await Post.findOne({
        where: {
          id: req.params.id,
        },
      });
      const comments = await Comment.findAll({
        where: {
          postId: req.params.id,
        },
      });
      res.render("posts/view", {
        title: 'Información de la publicación "' + post.title + '"',
        post: post,
        user: req.session,
        comments: comments,
      });
    }
  }

  async deleteComment(req, res, next) {
    const comment = await Comment.findOne({
      where: {
        id: req.params.id,
      },
    });
    await Comment.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.redirect("/posts/view/" + comment.postId);
  }

  async author(req, res, next) {
    const posts = await Post.findAll({
      where: {
        author: req.params.id,
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("posts/author", {
      title: 'Publicaciones del autor "' + req.params.id + '"',
      posts: posts,
      user: req.session,
    });
  }

  async category(req, res, next) {
    const posts = await Post.findAll({
      where: {
        category: req.params.id,
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("posts/category", {
      title: 'Publicaciones de la categoría "' + req.params.id + '"',
      posts: posts,
      user: req.session,
    });
  }

  async manage(req, res, next) {
    const posts = await Post.findAll({ order: [["createdAt", "DESC"]] });
    const authors = await Post.findAll({
      attributes: ["author"],
      group: ["author"],
      order: [["author", "ASC"]],
    });
    const categories = await Category.findAll({
      attributes: ["name"],
      order: [["name", "ASC"]],
    });
    const users = await User.findAll({
      attributes: ["name", "admin"],
      order: [["name", "ASC"]],
    });
    let postCount = Object.keys(posts).length;
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
    req.session.page = page;
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
    if (req.session.admin == true) {
      res.render("posts/manage", {
        title: "Administrador de diario web",
        posts: paginatedPosts,
        authors: authors,
        categories: categories,
        users: users,
        user: req.session,
        page: page,
        pageNumber: pageNumber,
        flashMessage: flashMessage,
      });
    } else {
      res.render("posts/index", {
        title: "Diario web",
        posts: paginatedPosts,
        authors: authors,
        categories: categories,
        user: req.session,
        page: page,
        pageNumber: pageNumber,
        flashMessage: "Error, no es administrador.",
      });
    }
  }

  async createCategory(req, res, next) {
    if (req.method === "POST") {
      await Category.create({
        name: req.body.name,
      });
      res.redirect("/posts/manage");
    } else {
      res.render("posts/createCategory", {
        title: "Crear categoría",
        user: req.session,
      });
    }
  }

  async deleteAuthor(req, res, next) {
    await Post.destroy({
      where: {
        author: req.params.id,
      },
    });
    req.session.flashMessage = "Se eliminaron las publicaciones del autor";
    res.redirect("/posts/manage");
  }

  async deleteCategory(req, res, next) {
    await Category.destroy({
      where: {
        name: req.params.id,
      },
    });
    req.session.flashMessage = "Se eliminó la categoría";
    await Post.update(
      {
        category: null,
      },
      {
        where: {
          category: req.params.id,
        },
      }
    );
    res.redirect("/posts/manage");
  }

  async deleteUser(req, res, next) {
    await User.destroy({
      where: {
        name: req.params.id,
      },
    });
    req.session.flashMessage = "Se eliminó el usuario";
    res.redirect("/posts/manage");
  }

  async demoteUser(req, res, next) {
    await User.update(
      {
        admin: 0,
      },
      {
        where: {
          name: req.params.id,
        },
      }
    );
    req.session.flashMessage = "Se degradaron los permisos del usuario";
    res.redirect("/posts/manage");
  }

  async promoteUser(req, res, next) {
    await User.update(
      {
        admin: 1,
      },
      {
        where: {
          name: req.params.id,
        },
      }
    );
    req.session.flashMessage = "Se promovieron los permisos del usuario";
    res.redirect("/posts/manage");
  }
}

module.exports = PostController;
