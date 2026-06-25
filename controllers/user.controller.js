const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { User, Role } = require("../models");
const passwordHash = require("password-hash");
const { nanoid } = require("nanoid");
const { Op } = require("sequelize");

const includeRole = [
  { model: Role, as: "role", attributes: ["id", "nama_role"] },
];

module.exports = {
  getUser: async (req, res) => {
    try {
      const { search, page, limit } = req.query;

      const currentPage = parseInt(page) || 1;
      const perPage = parseInt(limit) || 10;
      const offset = (currentPage - 1) * perPage;

      const { count, rows } = await User.findAndCountAll({
        where: search
          ? {
              [Op.or]: [
                { nama: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
              ],
            }
          : {},
        include: includeRole,
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
        limit: perPage,
        offset: offset,
      });

      return res.status(200).json(
        response(200, "success", {
          data: rows,
          total: count,
          currentPage: currentPage,
          totalPages: Math.ceil(count / perPage),
        }),
      );
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  detailUser: async (req, res) => {
    try {
      const { id } = req.params;
      const detailData = await User.findByPk(id, {
        include: includeRole,
        attributes: { exclude: ["password"] },
      });

      if (!detailData) {
        return res.status(404).json(response(404, "User tidak ditemukan"));
      }
      return res.status(200).json(response(200, "success", detailData));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  getProfile: async (req, res) => {
    try {
      const detailData = await User.findByPk(req.user.id, {
        include: includeRole,
        attributes: { exclude: ["password"] },
      });

      if (!detailData) {
        return res.status(404).json(response(404, "User tidak ditemukan"));
      }
      return res.status(200).json(response(200, "success", detailData));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama, email, no_telp, alamat, role_id } = req.body;

      const schema = {
        nama: { type: "string", min: 1, max: 100, optional: true },
        email: { type: "email", optional: true },
        no_telp: { type: "string", max: 20, optional: true },
        alamat: { type: "string", optional: true },
        role_id: { type: "number", integer: true, positive: true, optional: true },
      };

      const data = {};
      if (nama !== undefined) data.nama = nama;
      if (email !== undefined) data.email = email;
      if (no_telp !== undefined) data.no_telp = no_telp;
      if (alamat !== undefined) data.alamat = alamat;
      if (role_id !== undefined) data.role_id = Number(role_id);

      const validate = v.validate(data, schema);

      if (validate.length > 0) {
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json(response(404, "User tidak ditemukan"));
      }

      if (data.role_id) {
        const role = await Role.findByPk(data.role_id);
        if (!role) {
          return res.status(404).json(response(404, "Role tidak ditemukan"));
        }
      }

      await user.update(data);

      const result = await User.findByPk(id, {
        include: includeRole,
        attributes: { exclude: ["password"] },
      });
      return res.status(200).json(response(200, "updated", result));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json(response(404, "User tidak ditemukan"));
      }

      await user.destroy();
      return res.status(200).json(response(200, "deleted"));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },
};
