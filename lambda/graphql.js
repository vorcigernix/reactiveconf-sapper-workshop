import { PrismicLink } from "apollo-link-prismic";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";


const BASE_URL = process.env.CMS_URL || 'https://sapperweb.prismic.io/graphql';

const client = new ApolloClient({
    link: PrismicLink({
        uri: BASE_URL,
    }),
    cache: new InMemoryCache()
});

async function getProducts() {
client.query({
    query: gql`
    {
        allProducts {
          edges {
            node {
              categories {
                ... on ProductCategories {
                  link {
                    ... on Category {
                      title
                    }
                  }
                }
              }
              title
              description
              image
              price
            }
          }
        }
      }      
    `
}).then(response => {
    console.log(response);
    return response;
}).catch(error => {
    console.error(error);
    return error;
});
}

module.exports = async (req, res) => {
    const products = await getProducts();
    res.status(200).send(JSON.stringify(products));
  };