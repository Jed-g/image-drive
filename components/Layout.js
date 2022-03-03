import {
  createMuiTheme,
  ThemeProvider,
  CssBaseline,
  responsiveFontSizes,
  Backdrop,
  CircularProgress,
  Button,
  makeStyles,
} from "@material-ui/core";
import { useReducer, useLayoutEffect } from "react";
import Header from "./Header";
import Head from "next/head";

function selectTheme(state, themeType) {
  let darkTheme = createMuiTheme({
    palette: {
      primary: {
        main: "#00acc1",
      },
      error: {
        main: "#e53935",
      },
      type: "dark",
    },
  });

  let lightTheme = createMuiTheme({
    palette: {
      type: "light",
    },
  });
  darkTheme = responsiveFontSizes(darkTheme);
  lightTheme = responsiveFontSizes(lightTheme);

  if (themeType === "dark") {
    localStorage.setItem("theme", "dark");
    return darkTheme;
  }

  if (themeType === "light") {
    localStorage.setItem("theme", "light");
    return lightTheme;
  }

  if (localStorage.getItem("theme") === "dark") {
    return darkTheme;
  }

  if (localStorage.getItem("theme") === "light") {
    return lightTheme;
  }

  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return lightTheme;
  }

  return darkTheme;
}

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

function Layout({ children, loading }) {
  const [theme, setTheme] = useReducer(
    selectTheme,
    responsiveFontSizes(
      createMuiTheme({
        palette: {
          primary: {
            main: "#00acc1",
          },
          error: {
            main: "#e53935",
          },
          type: "dark",
        },
      })
    )
  );

  typeof window !== "undefined" &&
    useLayoutEffect(() => {
      setTheme();
    }, []);

  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Header setTheme={setTheme} />
        <main style={{ flexGrow: "1" }}>{children}</main>
      </div>
    </ThemeProvider>
  );
}

export default Layout;
