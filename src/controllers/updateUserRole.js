
const { User } = require("../db");

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  let { role } = req.body;
  role === 'User' ? role = 1 : role = 2;

  try {
    const userDb = await User.findByPk(id);
    if(userDb){
      if(userDb.rol_id === 1){
        await userDb.update({
          rol_id: 2
        });
        res.status(200).json({msg: 'User role updated successfully'});
      } else if(userDb.rol_id === 2){
        await userDb.update({
          rol_id: 1
        });
        res.status(200).json({msg: 'User role updated successfully'});
      }
    } else {
      res.status(404).json({msg: 'User not found'});
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  updateUserRole
};