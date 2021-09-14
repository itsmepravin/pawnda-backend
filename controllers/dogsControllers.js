import Dogs from '../models/Dogs.js'
import mongoose from 'mongoose'

export const getPosts = async (req, res) => {
	const { page } = req.query
	const LIMIT = 6
	const startIndex = (Number(page) - 1) * LIMIT
	const total = await Dogs.countDocuments({})
	const allPosts = await Dogs.find({}).sort({ _id : -1 }).limit(LIMIT).skip(startIndex)
	res.status(200).json({ data : allPosts, currentPage : Number(page), numberOfPages : Math.ceil(total/LIMIT)})
}

export const getPostsBySearch = async (req, res) => {
	const { searchQuery, tags } = req.query

	const name = new RegExp(searchQuery, 'i')
	const breed = new RegExp(searchQuery, 'i')

	const searchedPosts = await Dogs.find( { $or : [ { name }, { breed }, { tags : { $in : tags.split(',') } } ] } )

	res.status(200).json(searchedPosts)
}

export const getSinglePost = async (req, res) => {
	const { id } = req.params

	const post = await Dogs.findById(id)

	res.status(200).json(post)
}

export const createPosts = async (req, res) => {
	const body = req.body

	const newPost = new Dogs({...body, userID : req.userId})
	await newPost.save()

	res.status(201).json(newPost)
}

export const updatePosts = async (req, res) => {
	const { id } = req.params
	const body = req.body

	const postExists = await Dogs.findById(id)

	if(postExists) {
		const updatedPost = await Dogs.findByIdAndUpdate(id, body, {new:true})
		return res.status(200).json(updatedPost)
	} else {
		return res.status(400).json({"ERROR" : "Post with that ID does not exists!"})
	}	
}

export const deletePosts = async (req, res) => {
	const { id } = req.params

	const postExists = await Dogs.findById(id)

	if(postExists) {
		const updatedPost = await Dogs.findByIdAndRemove(id)
		return res.status(204).end()
	} else {
		return res.status(400).json({"ERROR" : "Post with that ID does not exists!"})
	}
}

export const likePosts = async (req, res) => {
	const { id } = req.params

	if(!req.userId) return res.status(409).json({"ERROR" : "Unauthentiated User!"})

	const currPost = await Dogs.findById(id)
	const index = currPost.likes.findIndex(id => id === String(req.userId))

	if(currPost) {
		if(index === -1) {
			currPost.likes.push(req.userId)
		} else {
			currPost.likes = currPost.likes.filter(id => id !== String(req.userId))
		}
		const updatedPost = await Dogs.findByIdAndUpdate(id, currPost, { new:true })

		return res.status(200).json(updatedPost)
	} else {
		return res.status(400).json({"ERROR" : "Post with that ID does not exists!"})
	}
}