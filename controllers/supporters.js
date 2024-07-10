export const Supporters = async (req, res) => {
    
    

    res.render("supporters", {
        
        username: req.session.username,
        role: req.session.role,
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


let thanks = 0;
export const Thanks = async (req, res) => {
    thanks++;
    let data = thanks.toString();
    if (thanks > 999) {
        data = 'Did you really click 1000 times?!';
    }
    res.send(data);
}