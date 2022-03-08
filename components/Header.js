import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  useTheme,
} from "@material-ui/core";
import Link from "next/link";
import { signOut, useSession } from "next-auth/client";
import { server } from "../config/";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import Brightness2Icon from "@material-ui/icons/Brightness2";

function handleSignout() {
  fetch(server + "/api/discardtoken", {
    method: "POST",
  });
  signOut();
}

function Header({ setTheme }) {
  const [session] = useSession();
  const theme = useTheme();

  return (
    <>
      {session && (
        <AppBar position="sticky">
          <Toolbar
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Link href="/">
                <Button style={{ marginRight: 15 }} variant="contained">
                  Home
                </Button>
              </Link>
              <Link href="/add">
                <Button variant="contained">Add</Button>
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button variant="contained" onClick={handleSignout}>
                Log out
              </Button>
              <IconButton
                style={{ marginLeft: 15 }}
                onClick={() => {
                  setTheme(theme.palette.type === "dark" ? "light" : "dark");
                }}
              >
                {theme.palette.type === "dark" ? (
                  <Brightness2Icon />
                ) : (
                  <Brightness7Icon style={{ color: "white" }} />
                )}
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
      )}
    </>
  );
}

export default Header;
