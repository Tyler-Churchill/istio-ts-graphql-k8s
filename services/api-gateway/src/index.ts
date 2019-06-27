import 'reflect-metadata';
import * as fetch from 'isomorphic-fetch';
import { HttpLink } from 'apollo-link-http';
import {
  makeRemoteExecutableSchema,
  introspectSchema,
  mergeSchemas
} from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { ApolloServer } from 'apollo-server';
import { buildSchema, Query, Resolver } from 'type-graphql';
import queryComplexity, {
  simpleEstimator,
  fieldConfigEstimator
} from 'graphql-query-complexity';
import { PubSub } from '@google-cloud/pubsub';
import { SERVICES, Service } from './Services';

const pubsub = new PubSub({
  apiEndpoint: 'localhost:8085',
  projectId: 'riiborn'
});

const getServices = (): Service[] => {
  return SERVICES;
};

const services: Service[] = getServices();

@Resolver()
class MainResolver {
  @Query(returns => Boolean, { description: 'Returns true if server is ready' })
  isReady() {
    return true;
  }
  @Query(returns => String, { description: '' })
  async version() {
    return 'v1.0.0';
  }
}

/**
 * Loads and returns a remote schema given the services URI
 * https://dev.to/alex_barashkov/using-docker-for-nodejs-in-development-and-production-3cgp
 * https://www.apollographql.com/docs/graphql-tools/remote-schemas
 * https://medium.com/@brammus/how-to-setup-simple-typescript-graphql-microservices-using-an-api-gateway-5587f3de0232
 */
const loadSchema = async (service: Service): Promise<GraphQLSchema> => {
  console.log(`Attempting to load schema from ${service.name} service`);
  const uri =
    process.env.NODE_ENV === 'production' ? service.prodUri : service.uri;
  console.log(`Hitting: ${uri}`);
  const schemaLink = new HttpLink({ uri, fetch });
  const schema = await introspectSchema(schemaLink);
  const remoteSchema = makeRemoteExecutableSchema({
    schema,
    link: schemaLink
  });
  console.log(`Retrieved schema from ${service.name}`);
  return remoteSchema;
};

const sleep = require('util').promisify(setTimeout);
const fetchSchema = async ({
  attempts = 3
}: {
  attempts?: number;
}): Promise<Array<GraphQLSchema>> => {
  try {
    return await Promise.all(services.map(service => loadSchema(service)));
  } catch (err) {
    if (attempts === 1) throw new Error('Max retires exceeded');
    await sleep(2500);
    return await fetchSchema({ attempts: attempts - 1 });
  }
};

// init/startup
(async () => {
  console.log(process.env);
  try {
    // load local schema definitions
    const localSchema = await buildSchema({
      resolvers: [MainResolver]
    });
    // grab schemas from all microservices
    const schemas = await fetchSchema({ attempts: 50 });
    // add local schema to all microservice schemas
    schemas.push(localSchema);
    // have now loaded all microservice schema, merge them
    const mergedSchema = mergeSchemas({
      schemas
    });
    // schema has been merged, start server
    const server = new ApolloServer({
      schema: mergedSchema,
      tracing: true,
      validationRules: [
        queryComplexity({
          maximumComplexity: 20,
          variables: {},
          estimators: [
            fieldConfigEstimator(),
            simpleEstimator({
              defaultComplexity: 1
            })
          ]
        }) as any
      ]
    });
    const { url } = await server.listen({
      port: process.env.PORT || 8090
    });
    console.log(`API-Gateway is running on ${url}`);
  } catch (e) {
    console.error(e);
  }
})();
