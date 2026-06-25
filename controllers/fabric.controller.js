const { nanoid } = require("nanoid");
const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { Kain } = require("../models");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");

module.exports = {
  getKain: async (req, res) => {
    try {
      const { search, page, limit } = req.query;

      const currentPage = parseInt(page)  || 1;
      const perPage     = parseInt(limit) || 10;
      const offset      = (currentPage - 1) * perPage;

      const { count, rows } = await Kain.findAndCountAll({
        where: search ? {
          [Op.or]: [
            { nama:     { [Op.like]: `%${search}%` } },
            { kategori: { [Op.like]: `%${search}%` } },
          ]
        } : {},
        order:  [["createdAt", "DESC"]],
        limit:  perPage,
        offset: offset,
      });

      return res.status(200).json(response(200, "success", {
        data:        rows,
        total:       count,
        currentPage: currentPage,
        totalPages:  Math.ceil(count / perPage),
      }));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  detailKain: async (req, res) => {
    try {
      const { id } = req.params;
      const detailData = await Kain.findByPk(id);
      if (!detailData) {
        return res.status(404).json(response(404, "Kain tidak ditemukan"));
      }
      return res.status(200).json(response(200, "success", detailData));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  createKain: async (req, res) => {
    try {
      const { nama, deskripsi, lebar, kategori, harga, stok } = req.body;

      const schema = {
        nama: { type: "string", min: 1, max: 100 },
        deskripsi: { type: "string", optional: true, max: 5000 },
        lebar: { type: "number", positive: true },
        kategori: { type: "string", min: 1, max: 50 },
        harga: { type: "number", positive: true },
        stok: { type: "number", min:0, integer: true },
      };

      const data = {
        nama: nama,
        deskripsi: deskripsi,
        lebar: parseFloat(lebar),
        kategori: kategori,
        harga: parseFloat(harga),
        stok: parseInt(stok),
      };

      const validate = v.validate(data, schema);

      if (validate.length > 0) {
        if (req.file) {
          const fileLocation = path.join(
            __dirname,
            "../uploads",
            req.file.filename,
          );
          if (fs.existsSync(fileLocation)) fs.unlinkSync(fileLocation);
        }
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      const createData = await Kain.create({
        id: nanoid(),
        nama: data.nama,
        deskripsi: data.deskripsi || null,
        gambar: req.file ? `/uploads/${req.file.filename}` : null,
        lebar: data.lebar,
        kategori: data.kategori,
        harga: data.harga,
        stok: data.stok
      });

      return res.status(201).json(response(201, "created", createData));
    } catch (error) {
      if (req.file) {
        const fileLocation = path.join(
          __dirname,
          "../uploads",
          req.file.filename,
        );
        if (fs.existsSync(fileLocation)) fs.unlinkSync(fileLocation);
      }
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  updateKain: async (req, res) => {
    try {
      const { nama, deskripsi, lebar, kategori, harga, stok } = req.body;
      const { id } = req.params;

      const schema = {
        nama: { type: "string", min: 1, max: 100, optional: true },
        deskripsi: { type: "string", max: 5000, optional: true },
        lebar: { type: "number", positive: true, optional: true },
        kategori: { type: "string", min: 1, max: 50, optional: true },
        harga: { type: "number", positive: true, optional: true },
        stok: { type: "number", min: 0, integer: true, optional: true },
      };

      const data = {};
      if (nama !== undefined) data.nama = nama;
      if (deskripsi !== undefined) data.deskripsi = deskripsi;
      if (lebar !== undefined) data.lebar = parseFloat(lebar);
      if (kategori !== undefined) data.kategori = kategori;
      if (harga !== undefined) data.harga = parseFloat(harga);
      if (stok !== undefined) data.stok = parseInt(stok);

      const validate = v.validate(data, schema);

      if (validate.length > 0) {
        if (req.file) {
          const fileLocation = path.join(
            __dirname,
            "../uploads",
            req.file.filename,
          );
          if (fs.existsSync(fileLocation)) fs.unlinkSync(fileLocation);
        }
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      const kainBefore = await Kain.findByPk(id);
      if (!kainBefore) {
        if (req.file) {
          const fileLocation = path.join(
            __dirname,
            "../uploads",
            req.file.filename,
          );
          if (fs.existsSync(fileLocation)) fs.unlinkSync(fileLocation);
        }
        return res.status(404).json(response(404, "Kain tidak ditemukan"));
      }

      if (req.file) {
        const imageName = kainBefore.getDataValue("gambar");
        if (imageName) {
          const fileLocation = path.join(
            __dirname,
            "../uploads",
            path.basename(imageName),
          );
          if (fs.existsSync(fileLocation)) {
            fs.unlinkSync(fileLocation);
          }
        }
        data.gambar = `/uploads/${req.file.filename}`;
      }

      await Kain.update(data, {
        where: { id: id },
      });

      const updateKain = await Kain.findByPk(id);
      return res.status(200).json(response(200, "updated", updateKain));
    } catch (error) {
      if (req.file) {
        const fileLocation = path.join(
          __dirname,
          "../uploads",
          req.file.filename,
        );
        if (fs.existsSync(fileLocation)) fs.unlinkSync(fileLocation);
      }
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  deleteKain: async (req, res) => {
    try {
      const { id } = req.params;
      const kainBefore = await Kain.findByPk(id);
      if (!kainBefore) {
        return res.status(404).json(response(404, "Kain tidak ditemukan"));
      }

      const imageName = kainBefore.getDataValue("gambar");
      if (imageName) {
        const fileLocation = path.join(
          __dirname,
          "../uploads",
          path.basename(imageName),
        );
        if (fs.existsSync(fileLocation)) {
          fs.unlinkSync(fileLocation);
        }
      }

      await Kain.destroy({
        where: { id: id },
      });
      return res.status(200).json(response(200, "deleted"));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },
};
