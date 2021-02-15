const configTransform = require('./configTransform');
const should = require('should');

const originalConfig = {
  sources: [
    {
      name: "Poke API",
      source: "https://pokeapi.co",
      handler: "rest",
      transforms: {
        "/api/v2/pokemon": {
          get: [
            {
              field: "root.results.[].name",
              type: "string",
              resolvers: [
                {
                  faker: "name.firstName"
                }
              ]
            }
          ]
        },
        "/api/v3/pokemon": {
          get: [
            {
              field: "root",
              type: "string",
              resolvers: [
                {
                  json: "./resolvers/pokemon-v3.json"
                },
                {
                  faker: "name.firstName"
                },
                {
                  path: "./resolvers/result-resolvers.js"
                }
              ]
            },
            {
              field: "root.results.[].origin",
              type: "string",
              resolvers: [
                {
                  faker: "address.country"
                }
              ]
            }
          ]
        }
      }
    },
    {
      name: "Wiki API",
      source: "https://wikimedia.org",
      handler: "rest",
      transforms: {
        "/api/rest_v1/feed/availability": {
          get: [
            {
              field: "picture_of_the_day",
              type: "string",
              resolvers: [
                {
                  path: "./resolvers/result-resolvers.js"
                }
              ]
            }
          ]
        }
      }
    },
    {
      name: "Countries API",
      source: "https://countries-274616.ew.r.appspot.com",
      handler: "graphql"
    }
  ]
};

const cases = [
  {
    input: originalConfig,
    expected: {
      rest: [
        {
          name: "Poke API",
          source: "https://pokeapi.co",
          handler: 'rest',
          transforms: {
            "/api/v2/pokemon": {
              get: [
                {
                  field: "root.results.[].name",
                  type: "string",
                  resolvers: [
                    {
                      faker: "name.firstName"
                    }
                  ]
                }
              ]
            },
            "/api/v3/pokemon": {
              get: [
                {
                  field: "root",
                  type: "string",
                  resolvers: [
                    {
                      json: "./resolvers/pokemon-v3.json"
                    },
                    {
                      faker: "name.firstName"
                    },
                    {
                      path: "./resolvers/result-resolvers.js"
                    }
                  ]
                },
                {
                  field: "root.results.[].origin",
                  type: "string",
                  resolvers: [
                    {
                      faker: "address.country"
                    }
                  ]
                }
              ]
            }
          }
        },
        {
          name: "Wiki API",
          source: "https://wikimedia.org",
          handler: "rest",
          transforms: {
            "/api/rest_v1/feed/availability": {
              get: [
                {
                  field: "picture_of_the_day",
                  type: "string",
                  resolvers: [
                    {
                      path: "./resolvers/result-resolvers.js"
                    }
                  ]
                }
              ]
            }
          }
        }
      ],
      graphql: [
        {
          name: "Countries API",
          source: "https://countries-274616.ew.r.appspot.com",
          handler: "graphql"
        }
      ]
    },
  },
];

describe('Config Transform - Normalize', () => {
  describe('should return normalized as expected', () => {
    cases.forEach((item, i) => {
      it(`test case ${i + 1}`, () => {
        should(configTransform.normalizedConfigByHandler(item.input)).be.deepEqual(
          item.expected
        );
      });
    });
  });
});
