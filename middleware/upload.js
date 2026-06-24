const multer = require("multer");
const path = require("path");
const fs = require("fs");

// In Docker, mount ./uploads → /usr/src/app/uploads (see server docker-compose volume)
const uploadsBase =
  process.env.UPLOAD_PATH || path.join(__dirname, "..", "uploads");
const projectsDir = path.join(uploadsBase, "projects");
try {
  fs.mkdirSync(projectsDir, { recursive: true });
} catch (err) {
  console.error(
    "Warning: could not create uploads directory:",
    projectsDir,
    err.message,
  );
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, projectsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const imageFilter = (_req, file, cb) => {
  const allowedExt = /\.(jpe?g|png|gif|webp)$/i;
  const allowedMime = /^image\/(jpe?g|png|gif|webp)$/i;
  if (allowedExt.test(file.originalname) && allowedMime.test(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error("Only JPG, PNG, GIF, or WebP images are allowed"));
};

const projectImageUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: imageFilter,
});

module.exports = { projectImageUpload };
