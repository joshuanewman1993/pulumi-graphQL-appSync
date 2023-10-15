import * as aws from "@pulumi/aws";
import { createIamRole } from "./stack/iam.js";
import { createGraphQLApi } from "./stack/graphqlApi.js";

// Create user table
const UsersTable = new aws.dynamodb.Table("usersTable", {
  attributes: [
    {
      name: "userId",
      type: "N",
    },
    {
      name: "name",
      type: "S",
    },
  ],
  hashKey: "userId",
  rangeKey: "name",
  readCapacity: 5,
  writeCapacity: 5,
});

// Create user table role for API
const UserRole = createIamRole("users", UsersTable);

// Create an AWS AppSync API
const GraphQLApi = createGraphQLApi();

// Create user dynamo table
const DynamoTable = new aws.appsync.DataSource("DynamoTable", {
  apiId: GraphQLApi.id,
  type: "AMAZON_DYNAMODB",
  dynamodbConfig: {
    tableName: UsersTable.name,
    awsRegion: UsersTable.region,
  },
  serviceRoleArn: UserRole.arn,
});

// resolver for getting all users
const ResolverGetUsers = new aws.appsync.Resolver("ResolverGetUsers", {
  apiId: GraphQLApi.id,
  dataSource: DynamoTable.name,
  type: "Query", // The type of this resolver
  field: "getUsers",
  requestTemplate: `
    {
        "version": "2017-02-28",
        "operation": "Scan",
        "limit": $util.defaultIfNull($context.args.limit, 20),
        "nextToken": $util.toJson($util.defaultIfNullOrEmpty($context.args.nextToken, null)),
    }`,
  responseTemplate: `$util.toJson($context.result.items)`,
});

// resolver for adding a user
const ResolverAddUsers = new aws.appsync.Resolver("ResolverAddUsers", {
  apiId: GraphQLApi.id,
  dataSource: DynamoTable.name,
  type: "Mutation",
  field: "addUser",
  requestTemplate: `{
        "version" : "2017-02-28",
        "operation" : "PutItem",
        "key" : {
            "userId" : $util.dynamodb.toDynamoDBJson($ctx.args.userId)
        },
        "attributeValues" : {
            "name": $util.dynamodb.toDynamoDBJson($ctx.args.name)
        }
    }`,
  responseTemplate: `$util.toJson($ctx.result)`,
});

export const dataSourceId = DynamoTable.id;
export const tableName = UsersTable.name;
export const graphqlApi = GraphQLApi.id;
export const apiId = GraphQLApi.id;
export const getUserResolverId = ResolverGetUsers.id;
export const addUserResolverId = ResolverAddUsers.id;
