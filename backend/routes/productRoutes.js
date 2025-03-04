const express = require('express');
const router = express.Router();
const { uploadExcel, uploadImage, uploadReviewImage } = require('../middleware/upload');
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview,
  processExcelFile,
  getProductSizes,
  getFrameTypesByProduct,
  getSubFrameTypesByProduct,
  addSubframeImage,
  getSubframeImages,
  getSubframeImageById,
  updateSubframeImage,
  deleteSubframeImage,
  getProductSubframeImages,
  getSubframeImage
} = require('../controllers/productController');
const { protectAdmin, protectUser } = require('../middleware/authMiddleware');

// Excel Import Route - handles single file upload
router.post('/excel', uploadExcel.single('excelFile'), processExcelFile);

// Product Routes
router.post('/add', 
  uploadImage.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'thumbnails', maxCount: 5 },
    { name: 'subframeImages', maxCount: 5 }
  ]),
  addProduct
);

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id',
  uploadImage.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'thumbnails', maxCount: 5 },
    { name: 'subframeImages', maxCount: 5 }
  ]),
  updateProduct
);
router.delete('/:id', deleteProduct);

// Size and Frame Type Routes
router.get('/:productId/sizes', getProductSizes);
router.get('/:productId/frame-types', getFrameTypesByProduct);
router.get('/:productId/sub-frame-types', getSubFrameTypesByProduct);

// Subframe Image Routes
router.post('/:productId/subframe-images', addSubframeImage);
router.get('/:productId/subframe-images', getSubframeImages);
router.get('/:productId/subframe-images/:subframeImageId', getSubframeImageById);
router.put('/:productId/subframe-images/:subframeImageId', updateSubframeImage);
router.delete('/:productId/subframe-images/:subframeImageId', deleteSubframeImage);
router.get('/:productId/subframe-image/:subFrameTypeId', getSubframeImage);

// Review Routes
router.post("/:productId/reviews", protectUser, uploadReviewImage.array("reviewImages", 5), addReview);
router.delete("/:productId/reviews/:reviewId", protectUser, deleteReview);

module.exports = router;
