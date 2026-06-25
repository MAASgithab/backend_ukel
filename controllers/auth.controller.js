const Validator = require("fastest-validator");
const v = new Validator();
const { response } = require("../helpers/response.formatter");
const { User, Role } = require("../models");
const passwordHash = require("password-hash");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

module.exports = {
  register: async (req, res) => {
    try {
      const { nama, email, password, no_telp, alamat } = req.body;

      const schema = {
        nama: { type: "string", min: 1, max: 100 },
        email: { type: "email" },
        password: { type: "string", min: 6 },
        no_telp: { type: "string", optional: true, max: 20 },
        alamat: { type: "string", optional: true },
      };

      const data = {
        nama: nama,
        email: email,
        password: password,
        no_telp: no_telp,
        alamat: alamat,
      };

      const validate = v.validate(data, schema);

      if (validate.length > 0) {
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      const emailExist = await User.findOne({ where: { email: email } });
      if (emailExist) {
        return res.status(400).json(response(400, "Email sudah terdaftar"));
      }

      const createData = await User.create({
        id: nanoid(),
        nama: data.nama,
        email: data.email,
        password: passwordHash.generate(data.password),
        no_telp: data.no_telp || null,
        alamat: data.alamat || null,
        role_id: 2,
      });

      const result = {
        id: createData.id,
        nama: createData.nama,
        email: createData.email,
        no_telp: createData.no_telp,
        alamat: createData.alamat,
        role_id: createData.role_id,
      };

      return res.status(201).json(response(201, "register berhasil", result));
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const schema = {
        email: { type: "email" },
        password: { type: "string", min: 1 },
      };

      const validate = v.validate({ email, password }, schema);

      if (validate.length > 0) {
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      const user = await User.findOne({
        where: { email: email },
        include: [{ model: Role, as: "role", attributes: ["id", "nama_role"] }],
      });

      if (!user) {
        return res.status(401).json(response(401, "Email atau password salah"));
      }

      const isPasswordValid = passwordHash.verify(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json(response(401, "Email atau password salah"));
      }

      const token = jwt.sign(
        {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role_id: user.role_id,
          role: user.role.nama_role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
      );

      return res.status(200).json(
        response(200, "login berhasil", {
          token: token,
          user: {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role_id: user.role_id,
            role: user.role.nama_role,
          },
        }),
      );
    } catch (error) {
      return res.status(500).json(response(500, "server error", error.message));
    }
  },
};
