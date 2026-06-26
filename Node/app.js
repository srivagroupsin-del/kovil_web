const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const winston = require("winston");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

dotenv.config({
  path: process.env.ENV_PATH || ".env",
});

const v8 = require("v8");
// console.log(
//   "Max heap size:",
//   (v8.getHeapStatistics().heap_size_limit / 1024 / 1024).toFixed(2),
//   "MB"
// );

const winstonLogger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.File({ filename: "error.log" })],
});

const { getConnectionWsinventoryPool } = require("./lib/connection");

getConnectionWsinventoryPool((err, connection) => {
  if (err) {
    console.error("Error connecting to database pool:", err.message);
    winstonLogger.error("Database connection error", { error: err.message });
    process.exit(1);
  } else {
    console.log("Successfully connected to database pool");
    if (connection && connection.release) {
      connection.release();
    }
  }
});


const templeBasicDetailsRouter = require("./routes/temple_basic_details");
const templeDetailsRouter = require("./routes/temple_details");
const templeHistoryRouter = require("./routes/temple_history");
const kudamuzhukkuRouter = require("./routes/kudamuzhukku");
const moolavarRouter = require("./routes/moolavar");
const udanuraiRouter = require("./routes/udanurai");
const nityaPoojasRouter = require("./routes/nitya_poojas");
const kilamaiPoojasRouter = require("./routes/kilamai_poojas");
const specialPoojasRouter = require("./routes/special_poojas");
const thodarPoojaiRouter = require("./routes/thodar_poojai");
const kuraiNivarthiRouter = require("./routes/kurai_nivarthi");
const nerttiKatanRouter = require("./routes/nertti_katan");
const kullamPeopleRouter = require("./routes/kullam_people");
const kattaliRouter = require("./routes/kattali");
const aranilaiyatturaiRouter = require("./routes/aranilaiyatturai");
const tharumakathaRouter = require("./routes/tharumakatha");
const porulatarRouter = require("./routes/porulatar");
const annatanamRouter = require("./routes/annatanam");
const visucamNeramRouter = require("./routes/visucam_neram");
const visucamRouter = require("./routes/visucam");
const templeAddressContactRouter = require("./routes/temple_address_contact");
const takavalRouter = require("./routes/takaval");
const parivaraDeivangalRouter = require("./routes/parivara_deivangal");
const pigaraDeivangalRouter = require("./routes/pigara_deivangal");
const ubaDeivangalRouter = require("./routes/uba_deivangal");
const baliDeivangalRouter = require("./routes/bali_deivangal");
const kavalDeivangalRouter = require("./routes/kaval_deivangal");
const loginRouter = require("./routes/login");
const donorsVolunteersRouter = require("./routes/donors_volunteers");
const userCommunitiesRouter = require("./routes/user_communities");
const communityKulaDeivamRouter = require("./routes/community_kula_deivam");
const outsideapisRouter = require("./routes/outsideapis");
const communitiesRouter = require("./routes/communities");
const subCommunitiesRouter = require("./routes/sub_communities");
const kulasRouter = require("./routes/kulas");
const kulaDeivamsRouter = require("./routes/kula_deivams");
const vagaiyarasRouter = require("./routes/vagaiyaras");
const communitySelectionsRouter = require("./routes/community_selections");

const app = express();

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

app.use(
  bodyParser.json({
    limit: "5mb",
  }),
);

app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    parameterLimit: 100000,
    extended: false,
  }),
);

app.use(
  cors({
    origin:"*"
  }),
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Content-Type: ${req.headers['content-type']}`);
  next();
});

app.use(logger("dev"));

app.use("/files", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).send("API RUNNING");
});

app.get("/health", (req, res) => {
  getConnectionWsinventoryPool((err, connection) => {
    if (err) {
      res.status(500).send("Database connection error");
    } else {
      if (connection && connection.release) {
        connection.release();
      }
      res.status(200).send("OK");
    }
  });
});

const API_PREFIX = "/api";

const registerRouter = (router) => {
  app.use(API_PREFIX, router);
  app.use("/", router);
};

registerRouter(templeBasicDetailsRouter);
registerRouter(templeDetailsRouter);
registerRouter(templeHistoryRouter);
registerRouter(kudamuzhukkuRouter);
registerRouter(moolavarRouter);
registerRouter(udanuraiRouter);
registerRouter(nityaPoojasRouter);
registerRouter(kilamaiPoojasRouter);
registerRouter(specialPoojasRouter);
registerRouter(thodarPoojaiRouter);
registerRouter(kuraiNivarthiRouter);
registerRouter(nerttiKatanRouter);
registerRouter(kullamPeopleRouter);
registerRouter(kattaliRouter);
registerRouter(aranilaiyatturaiRouter);
registerRouter(tharumakathaRouter);
registerRouter(porulatarRouter);
registerRouter(annatanamRouter);
registerRouter(visucamNeramRouter);
registerRouter(visucamRouter);
registerRouter(templeAddressContactRouter);
registerRouter(takavalRouter);
registerRouter(loginRouter);
registerRouter(donorsVolunteersRouter);
registerRouter(outsideapisRouter);
registerRouter(communitiesRouter);
registerRouter(subCommunitiesRouter);
registerRouter(kulasRouter);
registerRouter(kulaDeivamsRouter);
registerRouter(vagaiyarasRouter);
registerRouter(communitySelectionsRouter);

app.use("/api/parivara_deivangal", parivaraDeivangalRouter);
app.use("/parivara_deivangal", parivaraDeivangalRouter);

app.use("/api/pigara_deivangal", pigaraDeivangalRouter);
app.use("/pigara_deivangal", pigaraDeivangalRouter);

app.use("/api/uba_deivangal", ubaDeivangalRouter);
app.use("/uba_deivangal", ubaDeivangalRouter);

app.use("/api/bali_deivangal", baliDeivangalRouter);
app.use("/bali_deivangal", baliDeivangalRouter);

app.use("/api/kaval_deivangal", kavalDeivangalRouter);
app.use("/kaval_deivangal", kavalDeivangalRouter);

app.use("/api/user_communities", userCommunitiesRouter);
app.use("/user_communities", userCommunitiesRouter);

app.use("/api/community_kula_deivam", communityKulaDeivamRouter);
app.use("/community_kula_deivam", communityKulaDeivamRouter);



app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  winstonLogger.error(err.message, {
    url: req.originalUrl,
    method: req.method,
    error: err,
  });
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
  const options = {
    hostname: "localhost",
    port: PORT,
    path: "/health",
    method: "GET",
  };

  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {});
  });

  req.on("error", (error) => {
    console.error(`Health check error: ${error.message}`);
    winstonLogger.error("Health check failed", { error: error.message });
  });

  req.end();
});

module.exports = app;
