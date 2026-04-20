import axios from "axios";
import { prisma } from "../clients/db/index.js";
import JWTService from "../service/jwt.js";
import type { GraphqlContext } from "../interfaces.js";
import type { User } from "@prisma/client";
import UserService from "../service/UserService.js";



const queries: any={
    verifyGoogleToken:async(parent:any,{token}:{token:string})=>{
      
        const jwttoken = await UserService.verifyGoogleAuthToken(token);

        return jwttoken;

    },
    
    getCurrentUser : async (parent:any,args:any,ctx:GraphqlContext)=>{
       const id=ctx.user?.id;
       if(!id){
        console.log("Id not found for current user");
        return null;
       }

       const user =await UserService.getUserById(id);


       return user;
    },

    getUserById: async (parent:any,{id}:{id:string},ctx:GraphqlContext)=>{
       return UserService.getUserById(id);
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