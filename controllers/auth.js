const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createJWT } = require('../helpers/jwt');

const createUser = async( req, res = response ) => {
    
    const { email, password } =  req.body;
    
    try {
        
        let user = await User.findOne({ email });
        
        if ( user ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe'
            });
        }

        user = new User( req.body );   

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync( password, salt );
        
        await user.save();

        // Generar JWT
        const token = await createJWT( user.id, user.name );
    
        res.status(201).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        }); 

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }

};

const loginUser = async( req, res = response ) => {
    
    const { email, password } =  req.body;
    
    try {

        const user = await User.findOne({ email });
        
        if ( !user ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese email'
            });
        }

        // Confirmar los passwords
        const validPassword = bcrypt.compareSync( password, user.password );

        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            })
        }

        // Generar JWT
        const token = await createJWT( user.id, user.name );

        res.status(200).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });   
    }

};

const revalidateToken = async( req, res = response ) => {

    const { uid, name } = req;

    // Generar JWT
    const token = await createJWT( uid, name );

    res.json({
        ok: true,
        uid, 
        name,
        token,
    })

};

module.exports = {
    createUser,
    loginUser,
    revalidateToken,
}