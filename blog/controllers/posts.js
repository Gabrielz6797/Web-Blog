const Post = require('../models').Post;

class PostController {
    async index(req, res, next) {
        const posts = await Post.findAll();
        if (req.session.flashMessage) {
            res.render('posts/index', { title: 'Weblog', posts: posts, flashMessage: req.session.flashMessage });
        }
        else {
            res.render('posts/index', { title: 'Weblog', posts: posts});
        }
    }

    async create(req, res, next) {
        if (req.method === 'POST') {
            await Post.create({ title: req.body.title, body: req.body.body });
            res.redirect('/posts');
        }
        else {
            res.render('posts/create', { title: 'Weblog, crear'});
        }
    }

    async update(req, res, next) {
        if (req.method === 'POST') {
            await Post.update(
            {
                title: req.body.title,
                body: req.body.body
            },
            {
                where: {
                    id: req.params.id
                }
            });
            res.redirect('/posts');
        }
        else {
            const post = await Post.findOne({
                where: {
                    id: req.params.id
                }
            });
            res.render('posts/update', { title: 'Weblog, editar', post: post});
        }
    }

    async delete(req, res, next) {
        await Post.destroy({
            where: {
                id: req.params.id
            }
        });
        req.session.flashMessage = 'Se eliminó la publicación';
        res.redirect('/posts');
    }

}

module.exports = PostController;