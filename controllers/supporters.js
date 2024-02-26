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


let thanks = 0;
export const Thanks = async (req, res) => {
    thanks++;
    let data = thanks.toString();
    if (thanks > 999) {
        data = 'Did you really click 1000 times?!';
    }
    res.send(data);
}