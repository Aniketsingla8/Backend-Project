import mongoose from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if(!content) {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if(!tweet) {
        throw new ApiError(500, "Tweet not created")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet created successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user = await User.findById(req.params?.userId)

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(user._id)
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
                owner: 1,
                content: 1,
                createdAt: 1
            }
        }
    ])

    if(!tweets.length) {
        throw new ApiError(500, "Tweets not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            "Tweets found successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content} = req.body

    if(!content) {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findById(req.params?.tweetId)

    if(!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if(!tweet.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You are not allowed to update this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweet._id,
        {
            $set: {
                content
            }
        },
        {
            new: true,
        }
    )

    if(!updatedTweet) {
        throw new ApiError(500, "Tweet not updated")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const tweet = await Tweet.findById(req.params?.tweetId)

    if(!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if(!tweet.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You are not allowed to delete this tweet")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweet._id)

    if(!deletedTweet) {
        throw new ApiError(500, "Tweet not deleted")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedTweet,
            "Tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}