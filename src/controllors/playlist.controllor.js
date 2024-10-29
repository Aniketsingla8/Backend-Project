import mongoose from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //get name and description from the frontend
    const {name, description} = req.body

    if(!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const existingPlaylist = await Playlist.findOne({name})

    if(existingPlaylist) {
        throw new ApiError(400, "Playlist with this name already exists")
    }

    const newPlaylist = await Playlist.create(
        {
            name,
            description,
            owner: req.user?._id
        }
    )

    if(!newPlaylist) {
        throw new ApiError(500, "Error creating playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            newPlaylist,
            "Playlist created successfully") 
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    const {userId} = req.params

    if(!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user")
    }

    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
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
                            title: 1,
                            thumbnail: 1,
                            description: 1,
                            owner: {
                                username: 1,
                                avatar: 1,
                                fullname: 1
                            }
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            fullname: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                createdBy: {
                    $first: "$createdBy"
                }
            }
        },
        {
            $project: {
                videos: 1,
                name: 1,
                createdBy: 1,
                description: 1
            }
        }
    ])

    if(userPlaylists.length === 0) {
        throw new ApiError(404, "No playlists found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            userPlaylists,
            "User playlists retrieved successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    const {playlistId} = req.params

    if(!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                createdBy: {
                    $first: "$createdBy"
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
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
                            title: 1,
                            thumbnail: 1,
                            description: 1,
                            owner: {
                                username: 1,
                                fullname: 1,
                                avatar: 1
                            },
                            createdAt: 1,
                        }
                    }
                ]
            }
        },
        {
            $project: {
                name : 1,
                description: 1,
                createdBy: 1,
                videos: 1
            }
        }
    ])

    if(!playlist.length) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist[0],
            "Playlist retrieved successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // TODO: add video to playlist
    const {playlistId, videoId} = req.params

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Playlist and video are required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(!(playlist.owner).equals(req.user?.id)) {
        throw new ApiError(403, "You are not authorized to add video to this playlist")
    } 

    if(playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist")
    }

    const newPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if(!newPlaylist) {
        throw new ApiError(500, "Error adding video to playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            newPlaylist,
            "Video added to playlist successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const {playlistId, videoId} = req.params

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Playlist and video are required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(!(playlist.owner).equals(req.user?.id)) {
        throw new ApiError(403, "You are not authorized to remove video from this playlist")
    }

    if(!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not in playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist) {
        throw new ApiError(500, "Error removing video from playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const {playlistId} = req.params

    if(!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(!(playlist.owner).equals(req.user?.id)) {
        throw new ApiError(403, "You are not authorized to delete this playlist")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist) {
        throw new ApiError(500, "Error deleting playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedPlaylist,
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    if(!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(!playlist.owner.equals(req.user?.id)) {
        throw new ApiError(403, "You are not authorized to update this playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist) {
        throw new ApiError(500, "Error updating playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}