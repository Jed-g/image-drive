import { Divider, Typography } from "@material-ui/core";
import { useEffect } from "react";
import Head from "next/head";

function Custom404({ setLoading }) {
  useEffect(() => setLoading(false), []);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Head>
        <title>404</title>
      </Head>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h3" component="h1">
          404
        </Typography>
        <Divider orientation="vertical" flexItem style={{ margin: "0 25px" }} />
        <Typography>Page not found</Typography>
      </div>
    </div>
  );
}

export default Custom404;
