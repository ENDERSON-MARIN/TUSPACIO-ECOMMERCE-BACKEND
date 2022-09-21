const { User, Rol } = require("../../db.js")
const { Op } = require("sequelize")
const sendEmailUsers = require('../../helpers/sendEmailUsers')

/* INSERT USER IN DB */
const getLogin = async (req, res, next) => {
    const { name, email, email_verified, nickname, sid, id, picture, rol, status } = req.body
    // const { name, email, email_verified, nickname, sid, id,picture } = req.oidc.user
    try {
        // BUSCAR EL ID DEL ROL
        const role_id = await Rol.findAll({
            attributes: ["id"],
            where: { rolName: rol }
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
        if (user.length===0) {
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
            sendEmailUsers.sendMail(user)
            res.send(user);
        }
        //  SI EL USUARIO EXISTE LO RETORNA 
        else {
            sendEmailUsers.sendMail(user)
            res.send(user);
        }
    } catch (error) {
        res.send({ error: error.message })
    }
}

module.exports = {
    getLogin
};