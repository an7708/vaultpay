    const cloudinary = require('cloudinary').v2;

    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadPDFToCloud = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
        {
            resource_type: 'raw',
            folder: 'vaultpay/invoices',
            public_id: filename,
            format: 'pdf',
        },
        (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        }
        );
        uploadStream.end(buffer);
    });
    };

    module.exports = uploadPDFToCloud;