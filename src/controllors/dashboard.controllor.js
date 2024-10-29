import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/likes.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res, next) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {userId} = req.user

    if(!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const totalVideos = await Video.countDocuments({owner: userId})

    if(!totalVideos) {
        throw new ApiError(404, "No videos found")
    }

    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ])

    if(!totalViews.length) {
        throw new ApiError(404, "No views found")
    }

    const totalSubscribers = await Subscription.countDocuments({ channel: userId })

    if(!totalSubscribers) {
        throw new ApiError(404, "No subscribers found")
    }

    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $match: {
                "video.owner": mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: 1
                }
            }
        }
    ])

    if(!totalLikes.length) {
        const totalCount = 0
    } else {
        const totalCount = totalLikes[0].totalLikes
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {   
                totalVideos,
                totalViews: totalViews[0].totalViews,
                totalSubscribers,
                totalLikes: totalCount
            },
            "Channel stats retrieved successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res, next) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find({owner: req.user._id}).populate("owner", "username fullname avatar")

    if(!videos.length) {
        throw new ApiError(404, "No videos found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {   
                videos
            },
            "Videos retrieved successfully"
        )
    )
})

export {
    getChannelStats,
    getChannelVideos
}