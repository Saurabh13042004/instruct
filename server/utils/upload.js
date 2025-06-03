const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

let upload;

if (process.env.NODE_ENV === "production" && process.env.AWS_BUCKET_NAME) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      // Remove the acl property
      key: (req, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`);
      },
    }),
  });
} else {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  });
  upload = multer({ storage: storage });
}

module.exports = upload;