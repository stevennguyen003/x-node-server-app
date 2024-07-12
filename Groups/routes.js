import * as dao from "./dao.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = "uploads/";
        fs.mkdir(uploadsDir, { recursive: true }, (err) => {
            if (err) {
                console.error("Failed to create directory:", err);
                cb(err, uploadsDir);
            } else {
                console.log("Uploads directory ensured:", uploadsDir);
                cb(null, uploadsDir);
            }
        });
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `${req.params.userId}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});


const upload = multer({ storage: storage });

// RESTful APIs
export default function GroupRoutes(app) {

    // Creates a user for the session
    const createGroup = async (req, res) => {
        const group = await dao.createGroup(req.body);
        // Fetches any updates in user information
        const updatedGroup = await dao.findGroupById(group._id);
        res.json(updatedGroup);
    };

    // Deletes a group
    const deleteGroup = async (req, res) => {
        const status = await dao.deleteGroup(req.params.groupId);
        res.json(status);
    };

    // Find all groups in the database
    const findAllGroups = async (req, res) => {
        const groups = await dao.findAllGroups();
        res.json(groups);
    };

    // Find group by their unique id
    const findGroupById = async (req, res) => {
        const user = await dao.findGroupById(req.params.groupId);
        res.json(user);
    }
    // Update a group
    const updateGroup = async (req, res) => {
        const status = await dao.updateGroup(req.params.groupId, req.body);
        currentGroup = await dao.findGroupById(req.params.groupId);
        res.json(status);
    };

    // Upload a profile picture for the user
    const uploadProfilePicture = async (req, res) => {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        try {
            await dao.uploadProfilePicture(req.params.groupId, req.file.path);
            res.send(`File uploaded successfully: ${req.file.path}`);
        } catch (err) {
            res.status(500).send("Failed to update user with new profile picture.");
        }
    };


    app.post("/api/groups", createGroup);
    app.get("/api/groups", findAllGroups);
    app.get("/api/groups/:groupId", findGroupById);
    app.put("/api/groups/:groupId", updateGroup);
    app.delete("/api/groups/:groupId", deleteGroup);
    app.post(
        "/api/groups/:groupId/uploadProfilePicture",
        upload.single("profilePicture"),
        uploadProfilePicture
    );
}