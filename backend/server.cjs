const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const app = express();
app.use(cors());

const PORT = 5000;

// Define absolute paths
const UPLOADS_DIR = path.join(process.cwd(), "..","uploads");
const OUTPUT_JSONS_DIR = path.join(process.cwd(), "..","output", "jsons");
const OUTPUT_IMAGES_DIR = path.join(process.cwd(), "..","output", "images");
const FRONTEND_DIST_DIR = path.join(process.cwd(),  "..","frontend", "dist");
// Path to the Bash script
const SCRIPT_PATH = path.join(process.cwd(),"..","bash.sh")

// Multer setup for file uploads
const upload = multer({ dest: UPLOADS_DIR });

function getFolderNames(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())  // only folders
    .map(dirent => dirent.name);             // get folder names
}

const folderList = getFolderNames(UPLOADS_DIR);
console.log(folderList);


app.get('/folders', (req, res) => {
  try {
    const folderList = getFolderNames(UPLOADS_DIR);
    res.json({ folders: folderList });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read folders' });
  }
});

// Function to execute Bash script
const runBashScript = (imagePath, uploadId, callback) => {
    const outputImageDir = path.join(OUTPUT_IMAGES_DIR, uploadId);
    const outputJsonDir = path.join(OUTPUT_JSONS_DIR, uploadId);

    // Ensure output folders exist
    fs.mkdirSync(outputImageDir, { recursive: true });
    fs.mkdirSync(outputJsonDir, { recursive: true });

    console.log(`🔹 Running Bash Script: bash ${SCRIPT_PATH} ${imagePath}`);

    const env = {
        ...process.env,
        OUTPUT_IMAGE_DIR: outputImageDir,
        OUTPUT_JSON_DIR: outputJsonDir,
    };

    const processInstance = spawn("bash", [SCRIPT_PATH, imagePath], { env });

    let stdoutData = "", stderrData = "";

    processInstance.stdout.on("data", (data) => {
        stdoutData += data.toString();
        console.log(`📢 [BASH OUTPUT]: ${data.toString().trim()}`);
    });

    processInstance.stderr.on("data", (data) => {
        stderrData += data.toString();
        console.error(`⚠️ [BASH ERROR]: ${data.toString().trim()}`);
    });

    processInstance.on("close", (code) => {
        console.log(`✅ [BASH EXIT CODE]: ${code}`);
        callback(code === 0 ? null : new Error(`Exit code ${code}`), stdoutData, stderrData);
    });
};


// Serve static files
app.use("/output-images", express.static(OUTPUT_IMAGES_DIR));
app.use("/original-images", express.static(UPLOADS_DIR));

// List images
app.get("/list", async (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing ID in query" });

    const outputDir = path.join(OUTPUT_IMAGES_DIR, id);
    const uploadDir = path.join(UPLOADS_DIR, id);

    try {
        const getFiles = (folder) => fs.promises.readdir(folder).catch(() => []);
        const [outputImages, originalImages] = await Promise.all([
            getFiles(outputDir),
            getFiles(uploadDir),
        ]);
        res.json({ outputImages, originalImages });
    } catch (error) {
        res.status(500).json({ error: "Error reading directories" });
    }
});


// Download images
app.get('/download', (req, res) => {
    const zipFilePath = path.resolve(__dirname, "..", "zip", "output_images.zip");

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
        res.download(zipFilePath, "output_images.zip", (err) => {
            if (err) console.error(err);
            fs.unlinkSync(zipFilePath); // Delete zip after download
        });
    });

    archive.pipe(output);
    archive.directory(OUTPUT_IMAGES_DIR, false);
    archive.finalize();
});

// Handle file upload
// Handle file upload


app.post("/upload", upload.array("images"), (req, res) => {
    const uploadId = req.body.id; // ← extract id from formData

    if (!uploadId) {
        return res.status(400).json({ error: "Missing ID in request body" });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadSubdir = path.join(UPLOADS_DIR, uploadId); // ← folder path: uploads/{id}
    fs.mkdirSync(uploadSubdir, { recursive: true });       // ← make sure folder exists

    let processedCount = 0;
    const results = [];

    req.files.forEach((file) => {
        const newImagePath = path.join(uploadSubdir, `${file.filename}.jpg`);
        fs.renameSync(file.path, newImagePath);

        console.log("✅ Uploaded Image Path:", newImagePath);

        if (!fs.existsSync(newImagePath)) {
            return res.status(500).json({ error: `Uploaded file not found: ${file.originalname}` });
        }

       runBashScript(newImagePath, uploadId, (error, stdout, stderr) => {
            processedCount++;

            if (error) {
                results.push({ file: file.originalname, error: error.message });
            } else if (stderr) {
                results.push({ file: file.originalname, error: stderr });
            } else {
                results.push({ file: file.originalname, message: "Processed successfully", output: stdout });
            }

            if (processedCount === req.files.length) {
                res.json({ message: "All files processed", results });
            }
        });
    });
});

// // Serve static frontend files
// if (fs.existsSync(FRONTEND_DIST_DIR)) {
//     app.use(express.static(FRONTEND_DIST_DIR));

//     app.get("*", (req, res) => {
//         res.sendFile(path.join(FRONTEND_DIST_DIR, "index.html"));
//     });
// } else {
//     console.error("❌ ERROR: Frontend build folder not found!", FRONTEND_DIST_DIR);
// }

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
