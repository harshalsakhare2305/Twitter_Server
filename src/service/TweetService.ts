import { prisma } from "../clients/db/index.js";
import { redisClient } from "../clients/db/redis/index.js";

export interface CreateTweetPayload {

    content: string
    imageURL?: string
    userId:string


}


class TweetService{
    public static async createTweet(payload:CreateTweetPayload){
         
        const tweet =await prisma.tweet.create({
            data: {
                content: payload.content,
                imageURL: payload.imageURL ?? null,
                author: { connect: { id: payload.userId } },
            },
        });

        redisClient.del('tweets:all');
    }


    public static  async getAllTweet(){
        const cacheKey  =`tweets:all`;

        const cacheValue =await redisClient.get(cacheKey);
        if(cacheValue){
          return JSON.parse(cacheValue);
        }

        const tweets =await prisma.tweet.findMany({ orderBy: { createdAt: "desc" } });

        await redisClient.set(cacheKey,JSON.stringify(tweets));

        return tweets;
    }
}

export default TweetService