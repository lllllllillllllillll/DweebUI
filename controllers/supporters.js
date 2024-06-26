import { User } from "../database/models.js";

export const Supporters = async (req, res) => {
    
    let user = await User.findOne({ where: { UUID: req.session.UUID }});
    

    res.render("supporters", {
        first_name: user.name,
        last_name: user.name,
        name: user.name,
        id: user.id,
        email: user.email,
        role: user.role,
        avatar: req.session.user.charAt(0).toUpperCase(),
        alert: '',
        link1: '',
        link2: '',
        link3: '',
        link4: '',
        link5: '',
        link6: '',
        link7: '',
        link8: '',
        link9: '',
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