const express = require('express');

const router = express.Router();

const kainController = require('../controllers/fabric.controller');

const upload = require('../middlewares/upload');

router.post('/', upload.single('gambar'), kainController.createKain);
router.get('/', kainController.getKain);
// path dinamis
router.get('/:id', kainController.detailKain);
router.put('/:id', upload.single('gambar'), kainController.updateKain);
router.delete('/:id', kainController.deleteKain);

module.exports = router;