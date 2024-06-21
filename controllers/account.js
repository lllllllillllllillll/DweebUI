import { User } from "../database/models.js";

const no_auth = process.env.NO_AUTH || false;

export const Account = async (req, res) => {
    
    if (no_auth && req.hostname == 'localhost') { 
        res.render("account", {
            first_name: 'Localhost',
            last_name: 'Localhost',
            name: 'Localhost',
            id: 0,
            email: 'admin@localhost',
            role: 'admin',
            avatar: 'L',
            alert: '',
        });
        return;
    }
    
    let user = await User.findOne({ where: { UUID: req.session.UUID }});

    res.render("account", {
        first_name: user.name,
        last_name: user.name,
        name: user.name,
        id: user.id,
        email: user.email,
        role: user.role,
        avatar: req.session.user.charAt(0).toUpperCase(),
        alert: '',
    });


}
