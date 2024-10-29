import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    const {channelId} = req.params

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid Channel")
    }

    const isSubscribed = await Subscription.findOne(
        {
            $and: [
                {subscriber: req.user?._id},
                {channel: channelId}
            ]
        }
    )

    if(isSubscribed){
        const unsubscribed = await Subscription.findByIdAndDelete(isSubscribed._id)

        if(!unsubscribed){
            throw new ApiError(500, "Unsubscription failed")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                unsubscribed,
                "Unsubscribed successfully"
            )
        )
    } else {
        const subscribed = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })

        if(!subscribed){
            throw new ApiError(500, "Subscription failed")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribed,
                "Subscribed successfully"
            )
        )
    }
})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // controller to return subscriber list of a channel
    const {channelId} = req.params

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid Channel")
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
                subscriber: {
                        $first: "$subscriber"
                }
            }
        },
        {
            $project: {
                subscriber: 1,
                createdAt: 1,
            }
        }
    ])

    if(!subscriberList.length){
        throw new ApiError(500, "Failed to fetch subscribers")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscriberList,
            "Subscribers fetched successfully"
        )
    )
})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    // controller to return channel list to which user has subscribed
    const {subscriberId} = req.params

    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid User")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
                channel: {
                        $first: "$channel"
                }
            }
        },
        {
            $project: {
                channel: 1,
                createdAt: 1,
            }
        }
    ])

    if(!subscribedChannels.length){
        throw new ApiError(500, "Failed to fetch subscribed channels")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}