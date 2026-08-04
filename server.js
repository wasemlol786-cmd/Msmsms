const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

const PORT =
    process.env.PORT ||
    3000;


app.use(
    express.json({
        limit: "20mb"
    })
);


app.use(
    express.static(
        path.join(
            __dirname
        )
    )
);


/* ================================
MongoDB Connection
================================ */

async function connectDatabase() {

    try {

        const uri =
            process.env.MONGODB_URI
            .replace(
                "<USERNAME>",
                encodeURIComponent(
                    process.env
                    .MONGODB_USERNAME
                )
            )
            .replace(
                "<PASSWORD>",
                encodeURIComponent(
                    process.env
                    .MONGODB_PASSWORD
                )
            );


        await mongoose.connect(
            uri
        );


        console.log(
            "MongoDB connected successfully"
        );

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    }

}


/* ================================
User Schema
================================ */

const userSchema =
new mongoose.Schema({

    deviceId: {

        type:
            String,

        required:
            true,

        unique:
            true

    },


    displayName: {

        type:
            String,

        default:
            "FileForge User"

    },


    createdAt: {

        type:
            Date,

        default:
            Date.now

    }

});


const User =
mongoose.model(
    "User",
    userSchema
);


/* ================================
File Schema
================================ */

const fileSchema =
new mongoose.Schema({

    ownerId: {

        type:
            String,

        required:
            true

    },


    name: {

        type:
            String,

        default:
            "Untitled File"

    },


    content: {

        type:
            String,

        default:
            ""

    },


    folderId: {

        type:
            String,

        default:
            null

    },


    type: {

        type:
            String,

        default:
            "file"

    },


    deleted: {

        type:
            Boolean,

        default:
            false

    },


    createdAt: {

        type:
            Date,

        default:
            Date.now

    },


    updatedAt: {

        type:
            Date,

        default:
            Date.now

    }

});


const File =
mongoose.model(
    "File",
    fileSchema
);


/* ================================
Create / Update User
================================ */

app.post(
    "/api/users",
    async (
        request,
        response
    ) => {

        try {

            const {

                deviceId,

                displayName

            } =
            request.body;


            if (
                !deviceId
            ) {

                return response
                .status(400)
                .json({

                    success:
                        false,

                    message:
                    "Device ID is required"

                });

            }


            const user =
            await User.findOneAndUpdate(

                {

                    deviceId:
                    deviceId

                },

                {

                    displayName:
                    displayName ||
                    "FileForge User"

                },

                {

                    new:
                    true,

                    upsert:
                    true

                }

            );


            response.json({

                success:
                true,

                user:
                user

            });

        } catch (error) {

            response
            .status(500)
            .json({

                success:
                false,

                message:
                error.message

            });

        }

    }
);


/* ================================
Get User Files
================================ */

app.get(
    "/api/files/:deviceId",
    async (
        request,
        response
    ) => {

        try {

            const files =
            await File.find({

                ownerId:
                request.params
                .deviceId

            })
            .sort({

                updatedAt:
                -1

            });


            response.json({

                success:
                true,

                files:
                files

            });

        } catch (error) {

            response
            .status(500)
            .json({

                success:
                false,

                message:
                error.message

            });

        }

    }
);


/* ================================
Save File
================================ */

app.post(
    "/api/files",
    async (
        request,
        response
    ) => {

        try {

            const fileData =
            request.body;


            if (
                !fileData.ownerId
            ) {

                return response
                .status(400)
                .json({

                    success:
                    false,

                    message:
                    "Owner ID is required"

                });

            }


            const savedFile =
            await File.findOneAndUpdate(

                {

                    _id:
                    fileData._id

                },

                {

                    ...fileData,

                    updatedAt:
                    new Date()

                },

                {

                    new:
                    true,

                    upsert:
                    true,

                    setDefaultsOnInsert:
                    true

                }

            );


            response.json({

                success:
                true,

                file:
                savedFile

            });

        } catch (error) {

            response
            .status(500)
            .json({

                success:
                false,

                message:
                error.message

            });

        }

    }
);


/* ================================
Delete File
================================ */

app.delete(
    "/api/files/:id",
    async (
        request,
        response
    ) => {

        try {

            await File.findByIdAndDelete(

                request.params
                .id

            );


            response.json({

                success:
                true

            });

        } catch (error) {

            response
            .status(500)
            .json({

                success:
                false,

                message:
                error.message

            });

        }

    }
);


/* ================================
Start Server
================================ */

connectDatabase();


app.listen(
    PORT,
    () => {

        console.log(

            `FileForge is running on http://localhost:${PORT}`

        );

    }
);
