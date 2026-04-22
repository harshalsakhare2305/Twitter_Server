import axios from "axios";
import { prisma } from "../clients/db/index.js";
import JWTService from "../service/jwt.js";
import type { GraphqlContext } from "../interfaces.js";
import type { User } from "@prisma/client";
import UserService from "../service/UserService.js";


const mutations={
    followUser: async(parent:any,{to}:{to:string},ctx:GraphqlContext)=>{
         if(!ctx.user || !ctx.user.id) throw new Error("Unauthorized User")

        await UserService.followUser(ctx.user.id,to);

        return true;
    },

     UnfollowUser: async(parent:any,{to}:{to:string},ctx:GraphqlContext)=>{
         if(!ctx.user || !ctx.user.id) throw new Error("Unauthorized User")

        await UserService.UnfollowUser(ctx.user.id,to);


        return true;
    }
}


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
    }),

    followers:async(parent:User)=>{
        const result =await prisma.follows.findMany({where:{following:{id:parent.id}},
    include:{
        follower:true,
        following:true
    }
    }
        
    )

    return result.map(el=>el.follower);
    },
    
    following:async(parent:User)=>{
        const result =await prisma.follows.findMany({where:{follower:{id:parent.id}},
        include:{
            follower:true,
            following:true,
        }});

        return result.map(el=>el.following);
    },

    recommendedUsers:async (parent:User,_:any,ctx:GraphqlContext)=>{
       if(!ctx.user?.id)return;

       const myfollowings =await prisma.follows.findMany({where:{follower:{id:ctx?.user?.id}},
        include:{
            following:{
                include:{
                    followers:{
                        include:{
                            following:true
                        }
                    }
                }
            }
        }
    });

    const user:User[] =[];

       for(const followings of myfollowings){
        for(const followingofFollowing of followings.following.followers){
            if(followingofFollowing.following.id!==ctx.user.id && myfollowings.findIndex((e)=>e?.followerId===followingofFollowing.following.id)<0){
               user.push(followingofFollowing.following);
            }
        }
       }

   

       return user;
    }

}
}


export const resolvers={queries,extraaResolver,mutations}