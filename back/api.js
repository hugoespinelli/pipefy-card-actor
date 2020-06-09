const axios = require("axios");
const { flatten } = require("lodash");

const BASE_URL = "https://api.pipefy.com/graphql";

module.exports = class PipefyApi {
  constructor() {
    this.axios = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${process.env.PIPEFY_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
  }

  async get_all_cards(pipeId, phase = null) {
    let cursor = null;

    let candidates = [];

    while (true) {
      const { allCards } = await this.list_pipe_cards_paginated(
        pipeId,
        cursor
      ).then(res => res.data.data);

      candidates.push(allCards.edges);
      cursor = allCards.pageInfo.endCursor;

      if (allCards.pageInfo.hasNextPage == false) {
        break;
      }
    }

    candidates = flatten(candidates);

    return phase == null
      ? candidates
      : candidates.filter(c => c.node.current_phase.id == phase.toString());
  }

  list_pipe_cards_paginated(pipeId, lastCursor = null) {
    const afterCursor = lastCursor === null ? "" : `, after: "${lastCursor}"`;

    return this.axios.post("", {
      query: `
        {
          allCards(pipeId: ${pipeId}, first:500${afterCursor}) {
              pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
              }

              edges {
                      node {
                          id,
                          title,
                          current_phase { id, name }
                      }
                  }


          }
        }  
      `
    });
  }
};
