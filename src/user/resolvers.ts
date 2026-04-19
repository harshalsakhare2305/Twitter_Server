import axios from "axios";
import { prisma } from "../clients/db/index.js";
import JWTService from "../service/jwt.js";
import type { GraphqlContext } from "../interfaces.js";
import type { User } from "@prisma/client";

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

const queries: any={
    verifyGoogleToken:async(parent:any,{token}:{token:string})=>{
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

    },
    
    getCurrentUser : async (parent:any,args:any,ctx:GraphqlContext)=>{
       const id=ctx.user?.id;
       if(!id){
        console.log("Id not found for current user");
        return null;
       }

       const user =await prisma.user.findUnique({
         where:{
            id:id
         }
       });


       return user;
    },

    getUserById: async (parent:any,{id}:{id:string},ctx:GraphqlContext)=>{
       return prisma.user.findUnique({
         where:{
          id
         }
       });
    }
}

const extraaResolver={
    User:{
     tweets:(parent:User)=>
    prisma.tweet.findMany({
    where:{authorId:parent.id}
    })
}
}


export const resolvers={queries,extraaResolver}