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
                          current_phase { id, name },
                          fields {
                              field{ id },
                              name,
                              value,
                              array_value,
                              float_value
                          },
                      }
                  }


          }
        }  
      `
    });
  }

  get_phase(phaseId) {
    return this.axios.post("", {
      query: `
        {
          phase(id: ${phaseId}) {       
            name, 
            id,
            fields { 
                id,
                internal_id,
                uuid,
                description,
                label, 
                options, 
                required, 
                type,
                is_multiple
            }
          }
        }  
      `
    });
  }

  updateCardsFields(cardsIds, fieldId, fieldValue) {
    return Promise.all(
      cardsIds.map(cardId => {
        return this.axios.post("", {
          query: `
      mutation {
        updateCardField(input: {
            card_id: ${cardId},
            field_id: "${fieldId}",
            new_value: ["${fieldValue}"]

        })

        {success}
      }
                                  `
        });
      })
    );
  }

  moveCardToPhase(cardsIds, toPhaseId) {
    return Promise.all(
      cardsIds.map(cardId => {
        return this.axios.post("", {
          query: `
            mutation {
                moveCardToPhase(input: {card_id: ${cardId}, destination_phase_id: ${toPhaseId}})

                {card { updated_at id title}}
            }
          `
        });
      })
    );
  }
};
