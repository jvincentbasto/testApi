import fp from "fastify-plugin";
import fs from "node:fs";
import path from "node:path";
import cloudinary from "cloudinary";
import { v4 as uuidv4 } from "uuid";

export default fp(async (fastify) => {
  const BASE = path.join(process.cwd(), "src/storage");

  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const allowedVideoTypes = ["video/mp4", "video/mov", "video/webm"];
  const allowedAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const allowedTypes = {
    images: allowedImageTypes,
    videos: allowedVideoTypes,
    audios: allowedAudioTypes,
    files: allowedFileTypes,
  };
  const constants = {
    BASE,
    allowedImageTypes,
    allowedVideoTypes,
    allowedAudioTypes,
    allowedFileTypes,
    allowedTypes,
  };

  // Validate a file against allowed types
  const validateFile = (file, allowTypes) => {
    const type = file.mimetype;
    if (!type) return false;

    if (type.startsWith("image/") && allowTypes.images) {
      return allowTypes.images.includes(type);
    }
    if (type.startsWith("video/") && allowTypes.videos) {
      return allowTypes.videos.includes(type);
    }
    if (type.startsWith("audio/") && allowTypes.audios) {
      return allowTypes.audios.includes(type);
    }
    if (
      !type.startsWith("image/") &&
      !type.startsWith("video/") &&
      !type.startsWith("audio/") &&
      allowTypes.files
    ) {
      return allowTypes.files.includes(type);
    }

    return true; // if no restriction
  };

  // local upload
  const localUploadFile = async (file, options = {}) => {
    const { allowedTypes } = constants;
    const {
      table = "default",
      field = "files",
      allowTypes = allowedTypes,
    } = options;

    if (!validateFile(file, allowTypes)) {
      throw new Error(`File type ${file.mimetype} not allowed for ${field}`);
    }
    if (file.file?.truncated) {
      throw new Error("File too large");
    }

    // Create folder
    const folder = path.join(BASE, table, field);
    fs.mkdirSync(folder, { recursive: true });

    const ext = path.extname(file.filename);
    const filename = uuidv4() + ext;
    const dest = path.join(folder, filename);

    // Use toBuffer() if filepath doesn't exist
    if (file.filepath) {
      // old way
      await fs.promises.copyFile(file.filepath, dest);
    } else if (file.toBuffer) {
      const buffer = await file.toBuffer();
      await fs.promises.writeFile(dest, buffer);
    } else {
      throw new Error("No valid file data available for local upload");
    }

    return `/storage/${table}/${field}/${filename}`;
  };
  const localUploadFiles = async (files, options = {}) => {
    const uploaded = [];
    for (const file of files) {
      uploaded.push(await localUploadFile(file, options));
    }
    return uploaded;
  };
  // local delete
  const localRemoveFile = async (filePath) => {
    if (!filePath) return;

    const localPath = path.join(BASE, ...filePath.split("/").slice(2)); // skip /storage/
    try {
      const stats = await fs.promises.stat(localPath);
      if (stats.isFile()) {
        await fs.promises.unlink(localPath);
      } else {
        console.warn(`Skipping unlink: not a file -> ${localPath}`);
      }
    } catch (err) {
      if (err.code === "ENOENT") return; // file does not exist
      console.error("Error removing file:", err);
      throw err;
    }
  };
  const localRemoveFiles = async (filePaths) => {
    for (const filePath of filePaths) {
      await localRemoveFile(filePath);
    }
  };
  // local map
  const localMap = {
    upload: {
      single: localUploadFile,
      multiple: localUploadFiles,
    },
    remove: {
      single: localRemoveFile,
      multiple: localRemoveFiles,
    },
  };

  // cloudinary upload
  const cloudinaryUploadFile = async (file, options = {}) => {
    const { allowedTypes } = constants;
    const {
      table = "default",
      field = "files",
      allowTypes = allowedTypes,
    } = options;

    if (!validateFile(file, allowTypes)) {
      throw new Error(`File type ${file.mimetype} not allowed for ${field}`);
    }
    if (file.file?.truncated) {
      throw new Error("File too large");
    }

    cloudinary.v2.config({ url: fastify.config.CLOUDINARY_URL });

    const res = await cloudinary.v2.uploader.upload(file.filepath);
    return res.secure_url;
  };
  const cloudinaryUploadFiles = async (files, options = {}) => {
    const uploaded = [];
    for await (const file of files) {
      uploaded.push(await cloudinaryUploadFile(file, options));
    }
    return uploaded;
  };
  // cloudinary delete
  const cloudinaryDeleteFile = async (fileUrl) => {
    const parts = fileUrl.split("/");
    const filename = parts[parts.length - 1];
    const publicId = filename.split(".")[0];
    await cloudinary.v2.uploader.destroy(publicId);
  };
  const cloudinaryDeleteFiles = async (fileUrls) => {
    for (const url of fileUrls) {
      await cloudinaryDeleteFile(url);
    }
  };
  // cloudinary map
  const cloudinaryMap = {
    upload: {
      single: cloudinaryUploadFile,
      multiple: cloudinaryUploadFiles,
    },
    remove: {
      single: cloudinaryDeleteFile,
      multiple: cloudinaryDeleteFiles,
    },
  };

  fastify.decorate("upload", () => {
    let { upload, remove } = localMap;
    if (fastify.config.NODE_ENV === "production") {
      upload = cloudinaryMap.upload;
      remove = cloudinaryMap.remove;
    }

    const data = {
      constants,
      localMap,
      cloudinary,
      validateFile,
      //
      upload,
      remove,
    };

    return data;
  });
});
