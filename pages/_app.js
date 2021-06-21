import App from "next/app";
import axios from "axios";
import { parseCookies, destroyCookie } from "nookies";
import { isAdminPath, redirectUser } from "../utils";
import "../styles/globals.scss";
import "antd/dist/antd.css";
import "react-phone-input-2/lib/style.css";
import Head from "next/head";
import baseUrl from "../utils/baseUrl";

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const { token } = parseCookies(ctx);

    let pageProps = {};

    if (Component.getInitialProps) {
      try {
        pageProps = await Component.getInitialProps(ctx);
      } catch (e) {
        // redirect user if his session is invalid
        console.log(e);
        destroyCookie(ctx, "token");
        redirectUser(ctx, "/login");
        return;
      }
    }

    if (!token) {
      if (isAdminPath(ctx.pathname)) {
        redirectUser(ctx, "/login?redirect=" + ctx.pathname);
      }
    } else {
      try {
        console.log(baseUrl);
        const payload = { headers: { Authorization: token } };
        const url = `${baseUrl}/api/account`;
        const { data } = await axios.get(url, payload);
        const user = data;

        const isAdmin = user.roles.includes("admin");
        const isSuperAdmin = user.roles.includes("super-admin");

        const isNotAdminPermission =
          !(isAdmin || isSuperAdmin) && ctx.pathname === "/admin-reservations";

        const isNotSuperAdminPermission =
          !isSuperAdmin && ctx.pathname === "/admin-users";

        if (isNotAdminPermission || isNotSuperAdminPermission) {
          redirectUser(ctx, "/");
        }

        pageProps.user = user;
      } catch (error) {
        console.error("Error getting current user", error);
        destroyCookie(ctx, "token");
        redirectUser(ctx, "/login");
      }
    }
    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>Find Your Reservations</title>
          <link rel="icon" href="/favicon.jpg" />
          <link
            type="text/css"
            rel="stylesheet"
            href="/static/bootstrap.min.css"
          />
        </Head>
        <main>
          <Component {...pageProps} />
        </main>
      </>
    );
  }
}

export default MyApp;
