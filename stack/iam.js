import * as aws from "@pulumi/aws";

export function createIamRole(name, table) {
  const role = new aws.iam.Role(`${name}-role`, {
    assumeRolePolicy: aws.iam.getPolicyDocumentOutput({
      statements: [
        {
          actions: ["sts:AssumeRole"],
          principals: [
            {
              identifiers: ["appsync.amazonaws.com"],
              type: "Service",
            },
          ],
          effect: "Allow",
        },
      ],
    }).json,
  });

  const policy = new aws.iam.Policy(`${name}-policy`, {
    policy: aws.iam.getPolicyDocumentOutput({
      statements: [
        {
          actions: ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:Scan"],
          resources: [table.arn],
          effect: "Allow",
        },
      ],
    }).json,
  });

  const attachment = new aws.iam.RolePolicyAttachment(`${name}-rpa`, {
    role: role,
    policyArn: policy.arn,
  });

  return role;
}
