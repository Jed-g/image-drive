import {
  Paper,
  Button,
  TextField,
  Grid,
  useTheme,
  Typography,
  makeStyles,
  IconButton,
} from "@material-ui/core";
import ImageIcon from "@material-ui/icons/Image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { server } from "../config";
import { useSession } from "next-auth/client";
import Head from "next/head";

const useStyles = makeStyles((theme) => ({
  input: {
    minHeight: theme.spacing(12),
  },
  fileInputColorSecondary: {
    color: theme.palette.error.main,
  },
}));

function add({ setLoading }) {
  const classes = useStyles();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const theme = useTheme();
  const router = useRouter();

  const [errorState, setErrorState] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (document.getElementById("image-upload").value === "") {
      setErrorState(true);
      setLoading(false);
      console.error("Image required");
      return;
    }

    const formData = new FormData(e.target);
    const response = await fetch(`${server}/api/posts`, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      router.push("/");
    } else {
      setErrorState(true);
      setLoading(false);
      console.error(await response.json());
    }
  }
  const [session, loading] = useSession();

  useEffect(() => (loading ? setLoading(true) : setLoading(false)), [loading]);
  loading || session || router.push("/login");

  return (
    <Grid container justify="center">
      <Head>
        <title>Add Image</title>
      </Head>
      <Grid item xs={10} sm={8} md={6} lg={4}>
        <Paper variant="outlined" style={{ marginTop: theme.spacing(8) }}>
          <form
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <Grid
              container
              direction="column"
              spacing={4}
              style={{ padding: theme.spacing(2) }}
            >
              <Grid
                item
                container
                justify="center"
                style={{ marginTop: theme.spacing(2) }}
              >
                <Grid item>
                  <Typography variant="h4" component="h1">
                    Add Image
                  </Typography>
                </Grid>
              </Grid>
              <Grid item>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    style={{ marginRight: theme.spacing(1) }}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setErrorState(false);
                    }}
                    variant="outlined"
                    label="Title"
                    fullWidth
                    name="title"
                    onClick={() => setErrorState(false)}
                  />
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="image-upload"
                    type="file"
                    name="file"
                    onChange={(e) => {
                      if (e.target.files[0].size > 16777216) {
                        e.target.value = "";
                        setErrorState(true);
                        console.error("file larger than 16MB");
                      }
                      e.target.value
                        ? setImageSelected(true)
                        : setImageSelected(false);
                    }}
                  />
                  <label htmlFor="image-upload">
                    <IconButton
                      classes={{
                        colorSecondary: classes.fileInputColorSecondary,
                      }}
                      component="span"
                      color={
                        errorState
                          ? "secondary"
                          : imageSelected
                          ? "primary"
                          : "default"
                      }
                      onClick={() => setErrorState(false)}
                    >
                      <ImageIcon />
                    </IconButton>
                  </label>
                </div>
              </Grid>
              <Grid item>
                <TextField
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setErrorState(false);
                  }}
                  variant="outlined"
                  label="Description"
                  fullWidth
                  multiline
                  name="content"
                  InputProps={{
                    classes: { input: classes.input },
                  }}
                  onClick={() => setErrorState(false)}
                />
              </Grid>
              <Grid item>
                {errorState && (
                  <Typography
                    variant="h6"
                    component="p"
                    style={{ color: "#e53935" }}
                  >
                    Image is required. Max file size 16MB.
                  </Typography>
                )}
              </Grid>
              <Grid item>
                <Button
                  disableElevation
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default add;
