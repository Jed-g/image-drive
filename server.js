require("dotenv/config");
const express = require("express");
const cookieParser = require("cookie-parser");
const NextAuth = require("next-auth").default;
const next = require("next");
const mongoose = require("mongoose");
const UserSchema = require("./models/UserSchema");

const connection = mongoose.createConnection(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => console.log("connected to db (auth api)")
);

let User;
let nextAuthOptions = new Promise((resolve, reject) => {
  connection.once("open", () => {
    User = connection.model("User", UserSchema);
    resolve(require("./config/next-auth-options")(User));
  });
});

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(async () => await nextAuthOptions)
  .then(() => {
    const server = express();

    server.disable("x-powered-by");

    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use(cookieParser());
    // add custom path here
    // server.post('/request/custom', custom);

    server.use("/api/posts", require("./api/posts"));
    server.use("/images", require("./api/images"));
    server.use("/api/register", require("./api/register"));
    server.use("/api/discardtoken", require("./api/discardToken"));

    server.use(async (req, res, next) => {
      const baseUrl = "/api/auth/";

      if (!req.url.startsWith(baseUrl)) {
        return next();
      }
      // Fill in the "nextauth" [catch all route parameter](https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes)
      req.query.nextauth = req.url // start with request url
        .slice(baseUrl.length) // make relative to baseUrl
        .replace(/\?.*/, "") // remove query part, use only path part
        .split("/"); // as array of strings
      NextAuth(req, res, await nextAuthOptions);
    });

    server.all("*", handle);

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log("Ready on port " + PORT);
    });
  });
