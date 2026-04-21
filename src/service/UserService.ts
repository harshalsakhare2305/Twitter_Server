import axios from "axios";
import { prisma } from "../clients/db/index.js";
import JWTService from "./jwt.js";
import { connect } from "node:http2";


interface GoogleTokenResult{
    iss?:string;
     azp?:string;
     aud?:string;
    sub?:string;
    email:string;
    email_verified:string;
    nbf?:string;
    name?:string;
    picture?:string;
    given_name:string;
    family_name?:string;
    iat?:string;
    exp?:string;
    jti?:string;
    alg?:string;
    kid?:string;
    typ?:string;
}


class UserService{
    public static async verifyGoogleAuthToken(token:string){
         const GoogleToken=token;

     const googleUserdataURL = new URL(`https://oauth2.googleapis.com/tokeninfo`);
      googleUserdataURL.searchParams.set('id_token', GoogleToken);

      const{ data } =await axios.get<GoogleTokenResult>(googleUserdataURL.toString(),{
        responseType:'json'
      });
      
      const user = await prisma.user.findUnique({where:{email:data.email}});

        if(!user){
            await prisma.user.create({
                data:{
                    email:data.email,
                    firstName:data.given_name,
                    lastName:data.family_name!,
                    profileImageURL:data.picture!
                }
            })
        }

        const userIndb = await prisma.user.findUnique({where:{email:data.email}});

        if(!userIndb){
            throw new Error('User not found in database');
        }

        const jwttoken = await JWTService.generateToken(userIndb);


        return jwttoken;
    }

    public static getUserById(id:string){
        return  prisma.user.findUnique({
         where:{
            id:id
         }
       });
    }

    public static followUser(from:string,to:string){
        return prisma.follows.create({
            data:{
                follower:{connect:{id:from}},
                following:{connect:{id:to}},
            },
        });
    }


    public static UnfollowUser(from:string,to:string){
        return prisma.follows.delete({
            where:{followerId_followingId:{
                followerId:from,
                followingId:to
            }},
        });
    }


}

export default UserService