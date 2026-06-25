const { nanoid } = require("nanoid");
const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { Order, OrderDetail, Kain, User, sequelize } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  getOrder: async (req, res) => {
    try {
      const { search, page, limit } = req.query;

      const currentPage = parseInt(page) || 1;
      const perPage = parseInt(limit) || 10;
      const offset = (currentPage - 1) * perPage;

      const { count, rows } = await Order.findAndCountAll({
        where: search
          ? {
              status: { [Op.like]: `%${search}%` },
            }
          : {},
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "nama", "email", "no_telp"],
          },
          {
            model: OrderDetail,
            as: "order_details",
            include: [
              {
                model: Kain,
                as: "kain",
                attributes: ["id", "nama", "kategori"],
              },
            ],
          },
        ],
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

  // 🔹 Endpoint khusus untuk user melihat pesanan mereka sendiri
  getMyOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page, limit } = req.query;

      const currentPage = parseInt(page) || 1;
      const perPage = parseInt(limit) || 10;
      const offset = (currentPage - 1) * perPage;

      const { count, rows } = await Order.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: OrderDetail,
            as: "order_details",
            include: [
              {
                model: Kain,
                as: "kain",
                attributes: ["id", "nama", "kategori", "gambar"],
              },
            ],
          },
        ],
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

  detailOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const detailData = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "nama", "email", "no_telp", "alamat"],
          },
          {
            model: OrderDetail,
            as: "order_details",
            include: [
              {
                model: Kain,
                as: "kain",
                attributes: ["id", "nama", "kategori", "gambar", "stok"],
              },
            ],
          },
        ],
      });

      if (!detailData) {
        return res.status(404).json(response(404, "Order tidak ditemukan"));
      }
      return res.status(200).json(response(200, "success", detailData));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },
  createOrder: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { user_id, catatan, items } = req.body;

      const schema = {
        user_id: { type: "string", min: 1 },
        catatan: { type: "string", optional: true },
        items: {
          type: "array",
          min: 1,
          items: {
            type: "object",
            props: {
              fabric_id: { type: "string", min: 1 },
              jumlah: { type: "number", positive: true, integer: true },
            },
          },
        },
      };

      const data = {
        user_id: user_id,
        catatan: catatan,
        items: typeof items === "string" ? JSON.parse(items) : items,
      };

      const validate = v.validate(data, schema);

      if (validate.length > 0) {
        await t.rollback();
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      const user = await User.findByPk(data.user_id, { transaction: t });
      if (!user) {
        await t.rollback();
        return res.status(404).json(response(404, "User tidak ditemukan"));
      }

      let totalHarga = 0;
      const detailsData = [];

      for (const item of data.items) {
        const kain = await Kain.findByPk(item.fabric_id, { transaction: t });
        if (!kain) {
          await t.rollback();
          return res
            .status(404)
            .json(
              response(404, `Kain dengan id ${item.fabric_id} tidak ditemukan`),
            );
        }

        if (kain.stok < item.jumlah) {
          await t.rollback();
          return res
            .status(400)
            .json(
              response(
                400,
                `Stok kain "${kain.nama}" tidak mencukupi. Stok tersedia: ${kain.stok}`,
              ),
            );
        }

        const hargaSatuan = parseFloat(kain.harga);
        const subtotal = hargaSatuan * item.jumlah;
        totalHarga += subtotal;

        detailsData.push({
          id: nanoid(),
          fabric_id: item.fabric_id,
          jumlah: item.jumlah,
          harga_satuan: hargaSatuan,
          subtotal: subtotal,
        });
      }

      const orderId = nanoid();
      const orderBaru = await Order.create(
        {
          id: orderId,
          user_id: data.user_id,
          total_harga: totalHarga,
          status: "sedang diproses", // 🔹 Status awal berubah
          catatan: data.catatan || null,
        },
        { transaction: t },
      );

      const orderDetails = detailsData.map((d) => ({
        ...d,
        order_id: orderId,
      }));
      await OrderDetail.bulkCreate(orderDetails, { transaction: t });
      await t.commit();

      const result = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "nama", "email"],
          },
          {
            model: OrderDetail,
            as: "order_details",
            include: [
              {
                model: Kain,
                as: "kain",
                attributes: ["id", "nama", "kategori", "stok"],
              },
            ],
          },
        ],
      });

      return res.status(201).json(response(201, "created", result));
    } catch (error) {
      await t.rollback();
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  updateStatusOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const schema = {
        status: {
          type: "enum",
          values: ["sedang diproses", "dikirim", "selesai", "dibatalkan"],
        },
      };

      const validate = v.validate({ status }, schema);

      if (validate.length > 0) {
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json(response(404, "Order tidak ditemukan"));
      }

      await order.update({ status });
      return res.status(200).json(response(200, "updated", order));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },
  finalizeOrder: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id, {
        include: [{ model: OrderDetail, as: "order_details" }],
        transaction: t,
      });

      if (!order) {
        await t.rollback();
        return res.status(404).json(response(404, "Order tidak ditemukan"));
      }

      if (order.status !== "dikirim") {
        await t.rollback();
        return res
          .status(400)
          .json(
            response(
              400,
              "Status order harus 'dikirim' sebelum di-finalize",
            ),
          );
      }

      // Potong stok untuk setiap item
      for (const detail of order.order_details) {
        const kain = await Kain.findByPk(detail.fabric_id, { transaction: t });
        if (!kain) {
          await t.rollback();
          return res
            .status(404)
            .json(response(404, `Kain dengan id ${detail.fabric_id} tidak ditemukan`));
        }

        if (kain.stok < detail.jumlah) {
          await t.rollback();
          return res
            .status(400)
            .json(
              response(
                400,
                `Stok kain "${kain.nama}" tidak mencukupi. Stok tersedia: ${kain.stok}`,
              ),
            );
        }

        await Kain.decrement("stok", {
          by: detail.jumlah,
          where: { id: detail.fabric_id },
          transaction: t,
        });
      }

      await t.commit();

      return res
        .status(200)
        .json(response(200, "Pesanan telah dikirim dan stok terpotong"));
    } catch (error) {
      await t.rollback();
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  deleteOrder: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [{ model: OrderDetail, as: "order_details" }],
        transaction: t,
      });

      if (!order) {
        await t.rollback();
        return res.status(404).json(response(404, "Order tidak ditemukan"));
      }

      if (order.status === "dikirim") {
        for (const detail of order.order_details) {
          await Kain.increment("stok", {
            by: detail.jumlah,
            where: { id: detail.fabric_id },
            transaction: t,
          });
        }
      }

      await OrderDetail.destroy({ where: { order_id: id }, transaction: t });

      await Order.destroy({ where: { id }, transaction: t });

      await t.commit();
      return res.status(200).json(response(200, "deleted"));
    } catch (error) {
      await t.rollback();
      return res.status(500).json(response(500, "server error", error.message));
    }
  },
};
