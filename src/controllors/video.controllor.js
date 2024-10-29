import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

//in every controllor i still need to delete the files from the cloudinary after operation is successfully done in which it is needed
const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const {page = 1, limit = 10, query, sortBy = "createdAt", sortType = "asc", userId} = req.query

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)

    if (isNaN(pageNumber) || pageNumber < 1) {
        throw new ApiError(400, "Invalid page number");
    }
    if (isNaN(limitNumber) || limitNumber < 1) {
        throw new ApiError(400, "Invalid limit number");
    }

    const matchCriteria = {
        $or: [
            { 
                title: { 
                    $regex: query, 
                    $options: "i" 
                } 
            },
            { 
                description: { 
                    $regex: query, 
                    $options: "i" 
                } 
            }
        ]
    };

    if(userId){
        matchCriteria.owner = mongoose.Types.ObjectId(userId)
    }

    const videos = await Video.aggregate([
        {
            $match: matchCriteria
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                owner: {
                    username: 1,
                    fullname: 1,
                    avatar: 1
                }
            }
        },
        {
            $sort: {
                [sortBy]:sortType === "asc" ? 1 : -1
            }
        },
        {
            $skip: (pageNumber - 1) * limitNumber
        },
        {
            $limit: limitNumber
        }
    ])

    if(!videos.length){
        throw new ApiError(404, "Videos not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                videos
            },
            "Videos found successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const {title, description} = req.body

    if(!title || !description){
        throw new ApiError(400, "Title and Description are required")
    }

    const videoFileLocalPath = req?.file?.videoFile[0]?.path

    if(!videoFileLocalPath){
        throw new ApiError(400, "Video not found")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)

    if(!videoFile.url){
        throw new ApiError(500, "Video upload failed")
    }

    const thumbnailLocalPath = req?.file?.thumbnail[0]?.path

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail not found")
    }
    
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw new ApiError(500, "Thumbnail upload failed")
    }

    const savedVideo = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    if(!savedVideo){
        throw new ApiError(500, "Video upload failed")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                savedVideo
            },
            "Video uploaded successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const {videoId} = req.params

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                video
            },
            "Video found successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const {videoId} = req.params
    const {title, description} = req.body

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(400, "You are not authorized to update this video")
    }

    const thumbnailLocalPath = req?.file?.thumbnail[0]?.path

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail not found")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw new ApiError(500, "Thumbnail upload failed")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }
    )

    if(!updatedVideo){
        throw new ApiError(500, "Video update failed")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                updatedVideo
            },
            "Video updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const {videoId} = req.params

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(400, "You are not authorized to delete this video")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if(!deletedVideo){
        throw new ApiError(500, "Video deletion failed")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {deletedVideo},
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    //TODO: toggle publish status of video
    const {videoId} = req.params

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(400, "You are not authorized to change the status of this video")
    }

    const toggleStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        {
            new: true
        }
    )

    if(!toggleStatus){
        throw new ApiError(500, "Status update failed")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                toggleStatus
            },
            "Status updated successfully"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}