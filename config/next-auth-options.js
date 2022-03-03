const Providers = require("next-auth/providers");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const axios = require("axios");

module.exports = (userModel) => ({
  providers: [
    Providers.Credentials({
      id: "user-pass-login",
      async authorize(credentials) {
        const response = (
          await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            undefined,
            {
              params: {
                secret: process.env.SECRET_RECAPTCHA_KEY,
                response: credentials?.token,
              },
            }
          )
        ).data;
        if (!response.success) {
          throw new Error("Invalid Recaptcha token");
        } else if (response.score < 0.3) {
          throw new Error(
            `Trust factor too low. Your score: ${response.score}`
          );
        }
        console.log("Score: " + response.score);
        const userLookupFunction = async () => {
          try {
            const data = await userModel.findOne({
              username: credentials.username,
            });
            if (data) {
              const passwordMatch = await bcrypt.compare(
                credentials.password,
                data.password
              );
              if (passwordMatch) {
                return {
                  name: {
                    token_id: crypto.randomBytes(16).toString("hex"),
                    user_id: data._id,
                    username: data.username,
                  },
                };
              } else {
                return null;
              }
            } else {
              return null;
            }
          } catch (err) {
            console.log(err);
            return null;
          }
        };
        const user = await userLookupFunction();

        if (user) {
          return user;
        } else {
          throw new Error("Invalid username or password");
        }
      },
    }),
  ],
  session: {
    jwt: true,
    maxAge: parseInt(process.env.TOKEN_DURATION),
  },
  jwt: { encryption: true },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt(token, user, account, profile, isNewUser) {
      if (user) {
        return { ...token, ...token.name, name: undefined };
      } else {
        return Math.round(Date.now() / 1000) - token.iat >
          parseInt(process.env.TOKEN_DURATION)
          ? null
          : token;
      }
    },
    async session(session, token) {
      // Add property to session, like an access_token from a provider.
      session.user = undefined;
      session.username = token?.username;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
});
