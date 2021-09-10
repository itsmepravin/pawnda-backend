import express from 'express'

import { auth } from '../utils/middleware.js'

import { getPosts, getSinglePost, getPostsBySearch, createPosts, updatePosts, likePosts, deletePosts } from '../controllers/dogsControllers.js'

const dogsRouter = express.Router()

dogsRouter.get('/', getPosts)
dogsRouter.get('/search', getPostsBySearch)
dogsRouter.post('/', auth, createPosts)
dogsRouter.patch('/:id', auth, updatePosts)
dogsRouter.delete('/:id', auth, deletePosts)
dogsRouter.patch('/:id/likePost', auth, likePosts)
dogsRouter.get('/:id', getSinglePost)

export default dogsRouter