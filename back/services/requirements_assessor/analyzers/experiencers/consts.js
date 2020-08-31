const KNOWHOW_LEVELS = {
    HIGH: "alto",
    MEDIUM: "médio",
    LOW: "baixo",
    NONE: "nenhum",
};

const KNOWHOW_POINTS = {
  [KNOWHOW_LEVELS.NONE]: 0,
  [KNOWHOW_LEVELS.LOW]: 1,
  [KNOWHOW_LEVELS.MEDIUM]: 2,
  [KNOWHOW_LEVELS.HIGH]: 3,
};


module.exports = { KNOWHOW_LEVELS, KNOWHOW_POINTS };
