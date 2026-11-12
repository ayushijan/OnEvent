const {
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const { Upload } = require("@aws-sdk/lib-storage");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const crypto = require("crypto");
const sharp = require("sharp");

const s3 = require("../../config/s3");


// ==========================================
// COMMON IMAGE UPLOAD FUNCTION
// ==========================================

const uploadImage = async (file, folder, imageType) => {

    try {

        if (!file || !file.buffer) {
            throw new Error(`${imageType} image is required.`);
        }

        const allowedTypes = [
            "image/png",
            "image/jpeg"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error("Only PNG and JPG images are allowed.");
        }

        const optimizedImage = await sharp(file.buffer)
            .resize({
                width: 800,
                height: 800,
                fit: "inside",
                withoutEnlargement: true
            })
            .webp({
                quality: 75
            })
            .toBuffer();

        const uniqueFileName =
            `${folder}/${crypto.randomUUID()}.webp`;

        const upload = new Upload({

            client: s3,

            params: {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: uniqueFileName,
                Body: optimizedImage,
                ContentType: "image/webp",
                CacheControl: "public, max-age=86400"
            }

        });

        await upload.done();

        return {
            key: uniqueFileName
        };

    } catch (error) {

        console.error(`${imageType} Image Upload Error:`, error);

        throw error;

    }

};


// ==========================================
// COMMON IMAGE URL FUNCTION
// ==========================================

const getImageUrl = async (imageKey) => {

    try {

        if (!imageKey) {
            return null;
        }

        const command = new GetObjectCommand({

            Bucket: process.env.AWS_S3_BUCKET_NAME,

            Key: imageKey

        });

        return await getSignedUrl(
            s3,
            command,
            {
                expiresIn: 3600
            }
        );

    } catch (error) {

        console.error("S3 Image URL Error:", error);

        throw new Error("Unable to generate image URL.");

    }

};


// ==========================================
// CATEGORY IMAGE FUNCTIONS
// ==========================================

const uploadCategoryImage = async (file) => {
    return await uploadImage(file, "categories", "Category");
};

const getCategoryImageUrl = async (imageKey) => {
    return await getImageUrl(imageKey);
};


// ==========================================
// EVENT IMAGE FUNCTIONS
// ==========================================

const uploadEventImage = async (file) => {
    return await uploadImage(file, "events", "Event");
};

const getEventImageUrl = async (imageKey) => {
    return await getImageUrl(imageKey);
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    uploadCategoryImage,
    getCategoryImageUrl,
    uploadEventImage,
    getEventImageUrl
};