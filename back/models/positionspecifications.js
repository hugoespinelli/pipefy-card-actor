
const EXPERIENCE_LEVELS = {
    ESTAGIO: "estágio",
    JUNIOR: "júnior",
    PLENO: "pleno",
    SENIOR: "sênior",
};

class PositionSpecifications {
    constructor(experienceLevel, isRemote, payment) {
        this.experienceLevel = experienceLevel;
        this.isRemote = isRemote;
        this.payment = payment;
    }

}

module.exports = {PositionSpecifications, EXPERIENCE_LEVELS};
