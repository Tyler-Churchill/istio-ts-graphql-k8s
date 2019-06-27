export interface Service {
  name: string;
  uri: string;
  prodUri: string;
}

export const SERVICES: [Service] = [
  {
    name: 'Authentication',
    uri: 'http://localhost:8091/graphql',
    prodUri: `http://${process.env.AUTHENTICATION_SERVICE_HOST}:${
      process.env.AUTHENTICATION_SERVICE_PORT
    }`
  }
];
