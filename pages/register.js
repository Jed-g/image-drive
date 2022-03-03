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
import * as yup from "yup";
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

const validationSchema = yup.object({
  username: yup
    .string()
    .min(3)
    .max(30)
    .matches(/^[a-z0-9]+$/i, {
      message: "username has to be alphanumeric",
      excludeEmptyString: true,
    })
    .required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).max(30).required(),
});

export default function register({ setLoading }) {
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
        <title>Register</title>
      </Head>
      <Grid item xs={10} sm={8} md={4} lg={3}>
        <Paper
          style={{
            margin: `${theme.spacing(2)}px 0`,
            padding: theme.spacing(2),
          }}
        >
          <Formik
            initialValues={{ username: "", password: "", email: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setErrors }) => {
              const token = await executeRecaptcha("register_page");
              const registerResponse = await fetch(`${server}/api/register`, {
                method: "POST",
                body: JSON.stringify({
                  username: values.username,
                  email: values.email,
                  password: values.password,
                  token,
                }),
                headers: { "Content-type": "application/json" },
              });

              if (!registerResponse.ok) {
                const error = await registerResponse.json();
                setErrors({
                  username: error.username,
                  email: error.email,
                  password: error.password,
                });
              } else {
                const token = await executeRecaptcha(
                  "login_page_from_register"
                );
                const signinResponse = await signIn("user-pass-login", {
                  username: values.username,
                  password: values.password,
                  token,
                  redirect: false,
                  callbackUrl: server + "/",
                });
                signinResponse.url || console.log("Internal error");
              }
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
                      Register
                    </Typography>
                  </Grid>
                  <Grid item>
                    <InputField label="Username" name="username" />
                  </Grid>
                  <Grid item>
                    <InputField label="Email" name="email" />
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
                      Register
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
                        Already have an account?
                      </Typography>
                      <Link href="/login">
                        <Button>Login here...</Button>
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
