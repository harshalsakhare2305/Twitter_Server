import { connect } from "node:http2";
import { prisma } from "../../clients/db/index.js";
import type { GraphqlContext } from "../../interfaces.js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { Tweet, PrismaClient, User } from "@prisma/client";
import UserService from "../../service/UserService.js";
import type { CreateTweetPayload } from "../../service/TweetService.js";
import TweetService from "../../service/TweetService.js";



const mutations = {
    createTweet: async (parent: any, { payload }: { payload: CreateTweetPayload }, ctx: GraphqlContext) => {

        if (!ctx.user) throw new Error("You are not Authenticated");

        const t = await TweetService.createTweet({
            ...payload,
            userId:ctx.user.id
        });

        return t;

    }
}

const queries = {
    getAllTweets: () => TweetService.getAllTweet(),


    getSignedURLForTweet: async (parent: any, { imageType,Imagename }: { imageType: string,Imagename:String }, ctx: GraphqlContext) => {

        if (!ctx.user || !ctx.user.id) throw new Error('Unauthenticated User');

        const allowedImageTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

        if (!allowedImageTypes.includes(imageType)) {
            throw new Error('Unsupported ImageType');
        }

        const s3Client = new S3Client({
            region:process.env.AWS_DEFAULT_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        });

        const putObjectCommand =new PutObjectCommand({
            Bucket:process.env.AWS_S3_BUCKET_NAME!,
            Key:`uploads/${ctx.user.id}/tweets/${Imagename}-${Date.now().toString()}`,
        });


    const signedURl =await getSignedUrl(s3Client,putObjectCommand);

    return signedURl;


    }

}

const extraaResolvers = {
    Tweet: {
        author: (parent: Tweet) => UserService.getUserById(parent.authorId)
    }
}

export const resolvers = { mutations, extraaResolvers, queries };

