import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../database/schemas/User';
import auth from '../../config/auth';

class SignUpController{
    async create(req,res){
        const { nome, email, senha, telefones } = req.body;

        const UserExists = await User.find({
            email: email
        });

        if(UserExists.length>0){
            return res.status(400).json({ERRO: 'Email já existente'});
        }

        try {

            const user = await User.create({
                nome,
                email,
                //hashea a senha antes de salvar no banco
                senha: await bcrypt.hash(senha,8),
                telefones,
                //cria um JWT com o email do user e o segredo 
                token: jwt.sign({email},auth.secret,{
                    expiresIn: auth.expiresIn,
                }),
                ultimo_login: new Date()
            });

            const { id, ultimo_login, token, createdAt: data_criacao, updatedAt: data_atualizacao } = user

            return res.status(201).json({
                id,
                nome,
                email,
                telefones,
                data_criacao,
                data_atualizacao,
                ultimo_login,
                token
            });

        } catch (error) {

            if(error){
                console.log(error);
                return res.status(400).json({
                    Erro_de_validação:" Dados ausentes ou inválidos",
                    modelo: {
                        nome: "string",
                        email: "string",
                        senha: "string",
                        telefones: [
                            {
                                numero: "123456789",
                                ddd: "11"
                            }
                        ]
                    }
                });
            }

        }
    }
}

export default new SignUpController();