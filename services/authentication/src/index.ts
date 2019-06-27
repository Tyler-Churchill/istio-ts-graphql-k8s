import 'reflect-metadata';
import { ApolloServer, defaultPlaygroundOptions } from 'apollo-server-express';
import { buildSchema, Query, Resolver } from 'type-graphql';
import { Container } from 'typedi';
import * as TypeORM from 'typeorm';
import * as express from 'express';
import { AppContext } from './middleware/AppContext';
import * as session from 'express-session';
import UserResolver from './modules/users/users.resolvers';

@Resolver()
class MainResolver {
  @Query(returns => String, { description: '' })
  authVersion() {
    return 'v1.0.0';
  }
}

// init/startup
(async () => {
  try {
    // load local schema definitions
    const schema = await buildSchema({
      resolvers: [MainResolver, UserResolver],
      container: Container
    });

    const _express: any = express();

    _express.use(
      session({
        name: 'qid',
        secret: 'superdupersecretscret', // TODO abstract to env or google stored secret
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 * 7 * 365 // 7 years/??
        }
      })
    );

    // user inversion control container
    TypeORM.useContainer(Container);

    // schema has been merged, start server
    const server = new ApolloServer({
      schema,
      tracing: true,
      context: ({ req, res }: any) => {
        // bridge between express request and apollo request which gets passed to resolvers
        // pass along the request, response, and userId to resolver context
        const ctx: AppContext = {
          req,
          res,
          userId: req.session.userId
        };
        return ctx;
      }
    });

    server.applyMiddleware({ app: _express });

    _express.listen({ port: process.env.PORT || 8091 }, () => {
      console.log(`Auth Service is running`);
    });
  } catch (e) {
    console.error(e);
  }
})();
