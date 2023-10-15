// GraphQL Schema
export const schema = `
    type User {
        userId: Int!
        name: String
       }
      type Query {
        getUsers: [User]
      }
    
      type Mutation {
        addUser(userId: Int, name: String): User
      }
    `;
