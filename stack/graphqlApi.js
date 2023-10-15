import * as aws from "@pulumi/aws";
import { schema } from "./schema.js";

export function createGraphQLApi(){
  const api = new aws.appsync.GraphQLApi("GraphQLApi", {
    authenticationType: "API_KEY",
    schema: schema,
  });

  return api;
}
