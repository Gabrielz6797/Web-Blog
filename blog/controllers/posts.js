const Post = require("../models").Post;
var axios = require("axios");

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

  async auth(req, res, next) {
    // Store parameters in an object
    const params = {
      scope: "read:user",
      client_id: process.env.CLIENT_ID,
    };

    // Convert parameters to a URL-encoded string
    const urlEncodedParams = new URLSearchParams(params).toString();
    res.redirect(
      `https://github.com/login/oauth/authorize?${urlEncodedParams}`
    );
  }

  async githubCallback(req, res, next) {
    const { code } = req.query;

    const body = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
    };

    let accessToken;
    const options = { headers: { accept: "application/json" } };

    axios
      .post("https://github.com/login/oauth/access_token", body, options)
      .then((response) => response.data.access_token)
      .then(async (token) => {
        accessToken = token;

        const { data } = await axios({
          url: "https://api.github.com/user",
          method: "get",
          headers: {
            Authorization: `token ${accessToken}`,
          },
        });
        console.log(data); // { id, email, name, login, avatar_url }

        res.redirect(`/posts?token=${token}`);
      })
      .catch((err) => res.status(500).json({ err: err.message }));
  }
}

module.exports = PostController;
