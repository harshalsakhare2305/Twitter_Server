import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { prisma } from '../clients/db/index.js';
import { User } from '../user/index.js';
import type { GraphqlContext, JWTUser } from '../interfaces.js';
import JWTService from '../service/jwt.js';
import { Tweet } from './Tweet/index.js';

export async function createApp() {

    const app = express();

    app.use(bodyParser.json());
    app.use(cors());



    const typeDefs = `
      ${User.types}
      ${Tweet.types}
        type Query{
           ${User.queries}
        }

        type Mutation{
         ${Tweet.mutations}
        }
    `;
    const resolvers = {

        Query: {
            ...User.resolvers.queries
        },

        Mutation:{
           ...Tweet.resolvers.mutations 
        }
    };

    const server = new ApolloServer<GraphqlContext>({
        typeDefs,
        resolvers,
    });


    await server.start();

    app.use('/graphql', express.json(), expressMiddleware(server, {
        context: async ({ req, res }) => {
            const authHeader = req.headers.authorization
            const token = authHeader?.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : undefined;

        

            const user = token ? JWTService.verifyToken(token) : null;

            console.log("👤 Verified user from token:", user);
            return { user: user as JWTUser };
        }
    }));
    return app;
}

