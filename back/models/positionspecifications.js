
const EXPERIENCE_LEVELS = {
    ESTAGIO: "Estágio",
    JUNIOR: "Júnior",
    PLENO: "Pleno",
    SENIOR: "Senior",
};

class PositionSpecifications {
    constructor(experienceLevel, isRemote, payment) {
        this.experienceLevel = experienceLevel;
        this.isRemote = isRemote;
        this.payment = payment;
    }

}

module.exports = {PositionSpecifications, EXPERIENCE_LEVELS};
