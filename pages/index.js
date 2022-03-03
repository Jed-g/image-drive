import { server } from "../config";
import {
  Typography,
  Card,
  useTheme,
  CardContent,
  CardHeader,
  CardActions,
  CardActionArea,
  CardMedia,
  Button,
  CircularProgress,
  Backdrop,
  makeStyles,
  Grid,
  IconButton,
  Box,
} from "@material-ui/core";
import DeletePopup from "../components/DeletePopup";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import useSWR from "swr";
import Head from "next/head";
import { Close } from "@styled-icons/evaicons-solid/Close";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
}));

function index({ setLoading }) {
  const [session, loading] = useSession();
  const classes = useStyles();
  const theme = useTheme();

  const router = useRouter();
  useEffect(() => (loading ? setLoading(true) : setLoading(false)), [loading]);
  loading || session || router.push("/login");
  const [imagesLoaded, setImagesLoaded] = useState([]);
  const [expandImageIndex, setExpandImageIndex] = useState(null);

  const { data: posts, error: postsError } = useSWR(server + "/api/posts");

  return (
    <>
      {session && (
        <Grid container justify="center">
          <Head>
            <title>Your Images</title>
          </Head>
          <Grid item xs={10} sm={8} md={6} lg={4}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {session && (
                <Typography
                  variant="h3"
                  component="h1"
                  style={{ margin: `${theme.spacing(4)}px 0` }}
                >
                  Welcome to Image Drive, {session.username}
                </Typography>
              )}
              {postsError ? null : (
                <Typography
                  variant="h4"
                  component="h1"
                  style={{ margin: `${theme.spacing(4)}px 0` }}
                >
                  Your Images:
                </Typography>
              )}
              {postsError
                ? null
                : posts &&
                  posts.map(({ title, content, _id, imageFileName }, index) => (
                    <Card
                      variant="outlined"
                      key={_id}
                      style={{
                        margin: `${theme.spacing(4)}px 0`,
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      {imageFileName && (
                        <>
                          <Backdrop
                            className={classes.backdrop}
                            open={expandImageIndex === index}
                            onClick={() => setExpandImageIndex(null)}
                          >
                            <Box
                              style={{
                                position: "relative",
                                width: "100vw",
                                height: "100vh",
                              }}
                            >
                              {imagesLoaded.includes(index) || (
                                <CircularProgress />
                              )}
                              <Image
                                objectFit="contain"
                                layout="fill"
                                alt="image"
                                src={`${server}/images/${imageFileName}`}
                              />
                              <IconButton
                                onClick={() => setExpandImageIndex(null)}
                                size="small"
                                style={{
                                  position: "fixed",
                                  top: 10,
                                  right: 10,
                                }}
                              >
                                <Close height={50} style={{ margin: 5 }} />
                              </IconButton>
                            </Box>
                          </Backdrop>
                          <CardActionArea
                            onClick={() => setExpandImageIndex(index)}
                          >
                            <CardMedia>
                              <div
                                style={{
                                  height: 300,
                                  overflow: "hidden",
                                  position: "relative",
                                  background:
                                    "linear-gradient(45deg, rgba(254, 107, 139, 0.2) 30%, rgba(255, 143, 83, 0.2) 90%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {imagesLoaded.includes(index) || (
                                  <CircularProgress />
                                )}
                                <Image
                                  onLoad={() =>
                                    setImagesLoaded((prev) => [...prev, index])
                                  }
                                  objectFit="contain"
                                  layout="fill"
                                  alt="post picture"
                                  src={`${server}/images/${imageFileName}`}
                                />
                              </div>
                            </CardMedia>
                          </CardActionArea>
                        </>
                      )}
                      {title !== "" && <CardHeader title={title} />}
                      {content !== "" && (
                        <CardContent>
                          <Typography>{content}</Typography>
                        </CardContent>
                      )}
                      <CardActions>
                        <DeletePopup _id={_id} setLoading={setLoading} />
                      </CardActions>
                    </Card>
                  ))}
              {postsError
                ? null
                : posts &&
                  posts.length === 0 && (
                    <Typography style={{ margin: `${theme.spacing(4)}px 0` }}>
                      You currently have no images...
                    </Typography>
                  )}
            </div>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default index;
