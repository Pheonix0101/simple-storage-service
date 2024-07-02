import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";

const swaggerJSDocs = YAML.load("api.yaml");

export const swaggerServe = swaggerUI.serve;
export const swaggerSetup = swaggerUI.setup(swaggerJSDocs as any);

const swaggerConfig = {
  swaggerServe,
  swaggerSetup,
};

export interface SwaggerMiddleware {
  serve: typeof swaggerServe;
  setup: typeof swaggerSetup;
}
