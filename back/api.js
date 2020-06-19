const axios = require("axios");
const { flatten } = require("lodash");
const { convert_date } = require("./utils");

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

    async get_all_cards(pipeId, phases = []) {
        let cursor = null;

        let candidates = [];

        if (typeof(phases) !== typeof([])) {
            phases = [phases];
        }

        phases = phases.map(p => p.toString());

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

        return phases.length === 0
            ? candidates
            : candidates.filter(c => phases.includes(c.node.current_phase.id));
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
                          due_date,
                          late,
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

    updateCardsDueDate(cardsIds, newDueDate) {
        return Promise.all(
            cardsIds.map(cardId => {
                return this.axios.post("", {
                    query: `
                              mutation {
                                updateCard(input: {
                                    id: ${cardId},
                                    due_date: "${newDueDate}",
                        
                                })
                        
                                {
                                    card {
                                        id
                                    }
                                }
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

    get_pipe_info(pipeId) {
        return this.axios.post("", {
            query: `
        {
          pipe(id: ${pipeId}) {       
            name, 
            id,
            phases {
              id,
              name,
              lateCardsCount
            }
          }
        }  
      `
        });
    }


};
