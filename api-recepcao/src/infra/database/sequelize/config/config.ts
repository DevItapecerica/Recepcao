import { DATABASE_URL } from "../../../../core/config/env.js";

const envVar = DATABASE_URL;

export default {
    url: envVar,
    dialect: "mariadb",
}