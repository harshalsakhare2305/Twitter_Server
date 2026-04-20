import { prisma } from "../clients/db/index.js";

export interface CreateTweetPayload {

    content: string
    imageURL?: string
    userId:string


}


class TweetService{
    public static createTweet(payload:CreateTweetPayload){
        return prisma.tweet.create({
            data: {
                content: payload.content,
                imageURL: payload.imageURL ?? null,
                author: { connect: { id: payload.userId } },
            },
        });
    }


    public static getAllTweet(){
        return prisma.tweet.findMany({ orderBy: { createdAt: "desc" } })
    }
}

export default TweetService