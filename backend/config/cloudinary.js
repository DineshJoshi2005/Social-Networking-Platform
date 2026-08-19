import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadoOnCloudinary = async (filePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!filePath) {
            return null;
        }
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return uploadResult.secure_url;
    } catch (error) {
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch {
                // ignore
            }
        }
        console.log("Cloudinary upload error:", error);
        return null;
    }
};

export default uploadoOnCloudinary;