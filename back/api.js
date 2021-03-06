// Only for testing, remove this on production
require('dotenv').config();

const axios = require("axios");
const { flatten } = require("lodash");
const { sleep } = require("./utils");
const { setupCache } = require("axios-cache-adapter");

const BASE_URL = "https://api.pipefy.com/graphql";

const cache = setupCache({
    maxAge: 15 * 60 * 1000  // 15 min de cache
});

const TOO_MANY_REQUESTS_STATUS = 429;  // Tempo em milissegundos

class PipefyApi {
    constructor() {
        if (!PipefyApi.instance) {
            this.axios = axios.create({
                adapter: cache.adapter,
                baseURL: BASE_URL,
                timeout: 50000,
                headers: {
                    Authorization: `Bearer ${process.env.PIPEFY_TOKEN}`,
                    "Content-Type": "application/json"
                }
            });
            this.axios.interceptors.response.use(null, async error => {
                    if (error.response.status === TOO_MANY_REQUESTS_STATUS) {
                        const backoffFactor = error.response.headers['retry-after'] * 1000;  // Tempo em millissegundos
                        console.log(`Limite de requests excedida. Retentando em ${backoffFactor}ms`);
                        await sleep(backoffFactor);
                        return this.axios.request(error.config);
                    }
                    return Promise.reject(error);
                }
            );
            PipefyApi.instance = this;
        }

        return PipefyApi.instance;

    }

    async get_all_cards(pipeId, phasesIds = [], withoutFields=false) {
        let cursor = null;

        let candidates = [];

        if (typeof(phasesIds) !== typeof([])) {
            phasesIds = [phasesIds];
        }

        phasesIds = phasesIds.map(p => p.toString());

        while (true) {
            const { allCards } = await this.list_pipe_cards_paginated(
                pipeId,
                cursor,
                withoutFields
            ).then(res => res.data.data);

            candidates.push(allCards.edges);
            cursor = allCards.pageInfo.endCursor;

            if (allCards.pageInfo.hasNextPage == false) {
                break;
            }
        }

        candidates = flatten(candidates);

        return phasesIds.length === 0
            ? candidates
            : candidates.filter(c => phasesIds.includes(c.node.current_phase.id));
    }

    list_pipe_cards_paginated(pipeId, lastCursor = null, withoutFields=false) {
        const afterCursor = lastCursor === null ? "" : `, after: "${lastCursor}"`;
        const fieldsString = withoutFields ? "" : `fields {
              field{ id },
              name,
              value,
              array_value,
              float_value
              },`;
        return this.axios.post("", {
            query: `
        {
          allCards(pipeId: ${pipeId}, first:50${afterCursor}) {
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
                          ${fieldsString}
                          due_date,
                          late,
                          createdAt,
                          child_relations {
                                cards {
                                    id,
                                    title,
                                    path
                                },
                                name,
                                pipe {
                                    id,
                                    name
                                },
                                source_type
                            },
                            phases_history {
                              phase {
                                  name,
                                  id
                              }
                            },
                            labels {
                                id,
                                name
                            }
                          
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
            cards_can_be_moved_to_phases {
                id,
                name
            }
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
                return this.updateCardField(cardId, fieldId, fieldValue);
            })
        );
    }

    updateCardField(cardId, fieldId, fieldValue) {
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

    moveCardsToPhase(cardsIds, toPhaseId) {
        return Promise.all(
            cardsIds.map(cardId => {
                return this.moveCardToPhase(cardId, toPhaseId)
            })
        );
    }

    moveCardToPhase(cardId, toPhaseId) {
        return this.axios.post("", {
            query: `
            mutation {
                moveCardToPhase(input: {card_id: ${cardId}, destination_phase_id: ${toPhaseId}})

                {card { updated_at id title}}
            }
          `
        });
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
              lateCardsCount,
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
            },
            labels {
                id,
                name
            }
          }
        }  
      `
        });
    }


    async getPipeIdsFromDatabase() {
        const { data } = await this.axios.post("", {
            query: `
                {
                    table_records(table_id: "BhE5WSrq") {
                        edges {
                            node {
                                title,
                                record_fields {
                                    name,
                                    value
                                }
                            }
                        }
                    }
                }
      `
        });

        return data.data.table_records.edges;
    }

    async getTable(tableId) {
        const { data } = await this.axios.post("", {
            query: `
                {
                    table_records(table_id: "${tableId}") {
                        edges {
                            node {
                                title,
                                record_fields {
                                    name,
                                    value
                                }
                            }
                        }
                    }
                }
      `
        });

        return data.data.table_records.edges;
    }

    tagCard(cardId, newLabelId, oldLabelsIds = null) {
        if (!oldLabelsIds) {
            oldLabelsIds = []
        }
        oldLabelsIds.push(newLabelId);
        oldLabelsIds = oldLabelsIds.map(label => `"${label}"`);
        const labelsIdsInputs = oldLabelsIds.join(",");

        return this.axios.post("", {
            query: `
                mutation {
                    updateCard(input: {
                        id: ${cardId},
                        label_ids: [${labelsIdsInputs}],
                    })

                    {
                        card {
                            id
                        }
                    }
                }
            `
        });
    }


    getCard(cardId) {
        return this.axios.post("", {
            query: `
            {
               card(id: ${cardId}) {
                    expired,
                    late,
                    title,
                    createdAt
                    current_phase { id, name },
                    labels { id, name },
                    child_relations {
                        cards {
                            id,
                            title,
                            path
                        },
                        name,
                        pipe {
                            id,
                            name
                        },
                        source_type
                    },
                    fields {
                        array_value,
                        name,
                        value,
                        field {
                            id,
                            internal_id,
                            type,
                            label
                        },
                        
                    }
            
                }
            }
            `
        });
    }

}

const instance = new PipefyApi();
Object.freeze(instance);

module.exports = instance;
