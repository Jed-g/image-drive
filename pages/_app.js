import "../styles/globals.css";
import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import { Provider } from "next-auth/client";
import { SWRConfig } from "swr";
import * as gtag from "../lib/gtag";
import { useRouter } from "next/router";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import Head from "next/head";

const fetcher = (...args) =>
  fetch(...args).then(async (res) => {
    if (!res.ok) {
      throw new Error(await res.json());
    } else {
      return await res.json();
    }
  });

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <Provider session={pageProps.session}>
      <SWRConfig value={{ fetcher }}>
        <Layout loading={loading}>
          <Head>
            <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
            />
          </Head>
          <GoogleReCaptchaProvider reCaptchaKey="<Public reCAPTCHA v3 Key>">
            <Component {...pageProps} setLoading={setLoading} />
          </GoogleReCaptchaProvider>
        </Layout>
      </SWRConfig>
    </Provider>
  );
}

export default MyApp;
