const { User, Favorite, Order, Rol } = require("../db");
const axios = require("axios");
const { URL_API } = require("./globalConst");
const { Op } = require("sequelize")
/* GET ALL USERS FROM DB */

const getAllUsers = async (req, res) => {
  try {
    const dbInfo = await User.findAll({
      include: {
        model: Favorite,
        attributes: ["id"],
        through: { attributes: [] },
      }
    });
    res.send(dbInfo)
  } catch (error) {
    console.log(error);
  }
};


/* CREATE NEW USER IN THE DATABASE */
const createUser = async (req, res, next) => {
  /* ME TRAIGO TODOS LOS VALORES DEL CUERPO DE LA PETICION */
  const {
    name,
    nickname,
    email,
    email_verified,
    picture,
    sid,
    status
  } = req.body

  try {
    // BUSCAR EL ID DEL ROL
    const role_id = await Rol.findAll({
      attributes: ["id"],
      where: { rolName: "user" }
    })
    let roleid = role_id.map(e => e.id)
    // VERIFICA SI EL USUARIO EXISTE
    let user = await User.findAll({
      where: {
        [Op.or]: [
          { email: email },
          { nickname: nickname }
        ]
      }
    })
    
    // SI EL USUARIO NO EXISTE LO CREA EN LA DB
    if (user.length === 0) {
      user = await User.create({
        name,  //aca
        nickname,
        email,
        email_verified,
        sid,
        picture,
        status,
        rol_id: roleid
      })
      res.send(user);
    }
    //  SI EL USUARIO EXISTE LO RETORNA 
    else {
      res.send(user);
    }
  } catch (error) {
    res.send({ error: error.message })
  }
}


/* UPDATE ONE USER IN THE DATABASE */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nickname,
      name,
      email,
      email_verified,
      sid,
      picture,
      address,
      status,
      rol_id } = req.body;

    /* BUSCO EL USER EN LA BD POR EL ID */
    const userDb = await User.findByPk(id);
    /* ACTUALIZO EL USER */
    const updatedUser = await userDb.update({
      nickname,
      name,
      email,
      email_verified,
      sid,
      picture,
      address,
      status,
      rol_id,
    });
    res.status(200).json({
      succMsg: "User Updated Successfully!",
      updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/* DELETE ONE USER IN THE DATABASE */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    /* BUSCO EL USER EN LA BD POR EL ID */
    const userDb = await User.findByPk(id);
    /* MODIFICO EL STATUS DEL USER PARA HACER UN BORRADO LOGICO */
    const updatedUser = await userDb.update({
      status: false,
    });
    res.status(200).json({
      succMsg: "User Deleted Successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
