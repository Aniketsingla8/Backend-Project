import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video")
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                            fullname: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: 1
            }
        }
    ])

    if(!comments) {
        throw new ApiError(404, "No comments found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comments,
            "Comments found"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body

    if(!content) {
        throw new ApiError(400, "Content is required")
    }

    const video = await Video.findById(req.params?.videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        content,
        video: video._id,
        owner: req.user?._id
    })

    if(!comment) {
        throw new ApiError(500, "Failed to add comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment added"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body

    if(!content) {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.findById(req.params?.commentId)

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if(!comment.owner.equals(req.user?._id)) {
        throw new ApiError(403, "Unauthorized to update comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment._id,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if(!updatedComment) {
        throw new ApiError(500, "Failed to update comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const comment = await Comment.findById(req.params?.commentId)

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if(!comment.owner.equals(req.user?._id)) {
        throw new ApiError(403, "Unauthorized to delete comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(comment._id)

    if(!deletedComment) {
        throw new ApiError(500, "Failed to delete comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedComment,
            "Comment deleted"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}