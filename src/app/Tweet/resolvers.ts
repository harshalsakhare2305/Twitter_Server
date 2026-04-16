import { connect } from "node:http2";
import { prisma } from "../../clients/db/index.js";
import type { GraphqlContext } from "../../interfaces.js";

export interface CreateTweetPayload{
   
 content:string
 imageURL?:string
 
} 

const mutations={
    createTweet: async (parent:any,{payload}:{payload:CreateTweetPayload},ctx:GraphqlContext)=>{
      
        if(!ctx.user)throw new Error("You are not Authenticated");

      const t=await prisma.tweet.create({
            data:{
                content:payload.content,
                imageURL:payload.imageURL ?? null,
                author:{connect:{id:ctx.user.id}},
            },
        });
       
       return t; 

    }
}

export const resolvers ={mutations};