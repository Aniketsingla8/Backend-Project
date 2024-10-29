import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const {videoId} = req.params

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video")
    }

    const existingLike = await Like.findOne(
        {
            $and:[
                {video: videoId},
                {likedBy: req.user?._id}
            ]
        }
    )

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                existingLike,
                "Video unliked"
            )
        )
    } else {
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })

        if(!newLike) {
            throw new ApiError(400, "Failed to like video")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newLike,
                "Video liked"
            )
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    const {commentId} = req.params

    if(!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment")
    }

    const existingLike = await Like.findOne(
        {
            $and:[
                {comment: commentId},
                {likedBy: req.user?._id}
            ]
        }
    )

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                existingLike,
                "Comment unliked"
            )
        )
    } else {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

        if(!newLike) {
            throw new ApiError(400, "Failed to like comment")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newLike,
                "Comment liked"
            )
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    const {tweetId} = req.params

    if(!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet")
    }

    const existingLike = await Like.findOne(
        {
            $and:[
                {tweet: tweetId},
                {likedBy: req.user?._id}
            ]
        }
    )

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                existingLike,
                "Tweet unliked"
            )
        )
    } else {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })

        if(!newLike) {
            throw new ApiError(400, "Failed to like Tweet")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newLike,
                "Tweet liked"
            )
        )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: {
                    $exists: true,
                    $ne: null
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
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
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            description: 1,
                            duration: 1,
                            views: 1,
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                video: 1,
                likedBy: 1,
            }
        }
    ])
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}