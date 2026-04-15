import JWT from 'jsonwebtoken'
import "dotenv/config";
import type { User } from '@prisma/client';
import type { JWTUser } from '../interfaces.js';

class JWTService{
    public static async generateToken(user:User){

      const payload:JWTUser ={
        id:user?.id,
        email:user?.email
      }
      const token =JWT.sign(payload,process.env.JWT_SECRET_KEY!);

      return token;


    }

    public static verifyToken(token:string)
    {
        try {
          if(process.env.JWT_SECRET_KEY){
               const decoded = JWT.verify(token,process.env.JWT_SECRET_KEY) as JWTUser;
           return decoded;
          }else{
           console.log("jwt token not found");
          }
        
       
        } catch (error) {
          console.log("User is not Found");
          return null;
        }
    }
}

export default JWTService