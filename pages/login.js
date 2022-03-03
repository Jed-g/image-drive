import { signIn } from "next-auth/client";
import { useRouter } from "next/router";
import { server } from "../config";
import {
  Button,
  TextField,
  Paper,
  Grid,
  Typography,
  useTheme,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import { useState, useEffect } from "react";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import Link from "next/link";
import { useSession } from "next-auth/client";
import { Formik, Field, Form, useField } from "formik";
import Head from "next/head";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const InputField = ({ showPassword, setShowPassword, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : "";

  return field.name === "password" ? (
    <Field
      fullWidth
      variant="outlined"
      as={TextField}
      type={showPassword ? "text" : "password"}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword((prev) => !prev)}
              edge="end"
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...{
        ...field,
        ...props,
      }}
      helperText={errorText}
      error={!!errorText}
    />
  ) : (
    <Field
      type="text"
      fullWidth
      variant="outlined"
      as={TextField}
      {...{
        ...field,
        ...props,
      }}
      helperText={errorText}
      error={!!errorText}
    />
  );
};

export default function login({ setLoading }) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [session, loading] = useSession();
  const theme = useTheme();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => (loading ? setLoading(true) : setLoading(false)), [loading]);
  loading || (session && router.push("/"));

  return (
    <Grid
      style={{ height: "100%" }}
      container
      justify="center"
      alignItems="center"
    >
      <Head>
        <title>Login</title>
      </Head>
      <Grid item xs={10} sm={8} md={4} lg={3}>
        <Paper
          style={{
            margin: `${theme.spacing(2)}px 0`,
            padding: theme.spacing(2),
          }}
        >
          <Formik
            initialValues={{ username: "", password: "" }}
            onSubmit={async (values, { setErrors }) => {
              const token = await executeRecaptcha("login_page");
              const signinResponse = await signIn("user-pass-login", {
                username: values.username,
                password: values.password,
                token,
                redirect: false,
                callbackUrl: server + "/",
              });
              signinResponse.url ||
                setErrors({
                  username: signinResponse.error.slice(7),
                  password: signinResponse.error.slice(7),
                });
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <Grid container direction="column" spacing={2}>
                  <Grid item>
                    <Typography
                      variant="h5"
                      component="h1"
                      style={{ textAlign: "center" }}
                    >
                      Log in
                    </Typography>
                  </Grid>
                  <Grid item>
                    <InputField label="Username" name="username" />
                  </Grid>
                  <Grid item>
                    <InputField
                      label="Password"
                      name="password"
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      fullWidth
                      variant="contained"
                    >
                      Log in
                    </Button>
                  </Grid>
                  <Grid item>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography style={{ margin: "0 5px" }}>
                        Don't have an account?
                      </Typography>
                      <Link href="/register">
                        <Button>Register here...</Button>
                      </Link>
                    </div>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
      </Grid>
    </Grid>
  );
}
