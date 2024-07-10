import { User } from "../database/models.js";

const no_auth = process.env.NO_AUTH || false;

export const Account = async (req, res) => {
    
    if (no_auth && req.hostname == 'localhost') { 
        res.render("account", {
            first_name: 'Localhost',
            last_name: 'Localhost',
            username: 'Localhost',
            id: 0,
            email: 'admin@localhost',
            role: 'admin',
            avatar: 'L',
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
        return;
    }
    
    let user = await User.findOne({ where: { userID: req.session.userID }});

    res.render("account", {
        first_name: user.name,
        last_name: user.name,
        username: req.session.username,
        id: user.id,
        email: user.email,
        role: user.role,
        avatar: req.session.username.charAt(0).toUpperCase(),
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
