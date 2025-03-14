const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/add', categoryController.addCategory);
router.get('/all', categoryController.getCategories);
router.delete('/delete/:id', categoryController.deleteCategory);


module.exports = router;
