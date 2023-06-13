const User = require("../models").User;
var axios = require("axios");

class UserController {
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
        if (data.name != null && data.email != null) {
          req.session.userName = data.login;
          req.session.name = data.name;
          req.session.email = data.email;
          req.session.admin = false;
          res.redirect("/posts");
        } else {
          res.render("users/login", {
            title: "Iniciar sesión",
            message:
              "Error, la cuenta de github no tiene los datos necesarios o estos son privados. Por favor inicie sesión de manera local.",
          });
        }
      })
      .catch((err) => res.status(500).json({ err: err.message }));
  }

  async register(req, res, next) {
    if (req.method === "POST") {
      if (req.body.password === req.body.passwordConfirm) {
        await User.create({
          userName: req.body.userName,
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          admin: 0,
        });
        req.session.userName = req.body.userName;
        req.session.name = req.body.name;
        req.session.email = req.body.email;
        req.session.admin = false;
        res.redirect("/posts");
      } else {
        res.render("users/register", {
          title: "Registrarse",
          message: "Error, las contraseñas no coinciden.",
        });
      }
    } else {
      res.render("users/register", { title: "Registrarse" });
    }
  }

  async login(req, res, next) {
    if (req.method === "POST") {
      const user = await User.findOne({
        where: {
          email: req.body.email,
          password: req.body.password,
        },
      });
      if (user) {
        req.session.userName = user.userName;
        req.session.name = user.name;
        req.session.email = user.email;
        req.session.admin = user.admin;
        res.redirect("/posts");
      } else {
        res.render("users/login", {
          title: "Iniciar sesión",
          message: "Error, credenciales incorrectas.",
        });
      }
    } else {
      res.render("users/login", { title: "Iniciar sesión" });
    }
  }

  async logout(req, res, next) {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          res.status(400).send("Error al cerrar la sesión.");
        } else {
          res.redirect("/posts");
        }
      });
    } else {
      res.end();
    }
  }
}

module.exports = UserController;
