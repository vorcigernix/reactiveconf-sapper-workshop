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

function reduceCategories(list, { data }) {
  if (!data.allProducts.edges[0].node.categories[0].link.title[0].text) {
    console.log('malformed', data);
    list.add("malformed");
    return list;
  }
  console.log(data);
  const { categories, title, image, price, description } = data;
  const categoryName = categories[0].link.data.title[0].text;
  const mealName = title[0].text;
  const descriptionText = description[0].text;

  return {
    ...list,
    [categoryName]: (list[categoryName] || []).concat({
      name: mealName,
      image,
      price,
      description: descriptionText,
    }),
  };
}

module.exports = async (req, res) => {
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
    const itemsByCategory = response.results.reduce(reduceCategories, {});
    res.status(200).send(JSON.stringify(itemsByCategory));
  }).catch(error => {
    res.status(500).send(error);
  });

};