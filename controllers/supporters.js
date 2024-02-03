import { User } from "../database/models.js";

export const Supporters = async (req, res) => {
    
    if (!req.session.UUID) return res.redirect("/login");

    let user = await User.findOne({ where: { UUID: req.session.UUID }});
    

    res.render("supporters", {
        first_name: user.name,
        last_name: user.name,
        name: user.name,
        id: user.id,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
    });


}
