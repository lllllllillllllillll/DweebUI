import { User } from "../database/models.js";

export const Account = async (req, res) => {
    

    let user = await User.findOne({ where: { UUID: req.session.UUID }});

    res.render("account", {
        first_name: user.name,
        last_name: user.name,
        name: user.name,
        id: user.id,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        alert: '',
    });


}
