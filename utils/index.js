import { notification } from "antd";
import Router from "next/router";
import cookie from "js-cookie";

export function isAdminPath(path) {
  let isAdminPath = path === "/admin-users" || path === "/admin-reservations";

  return isAdminPath;
}

export function redirectUser(ctx, location) {
  if (ctx.req) {
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    Router.push(location);
  }
}

export function showNotification(message) {
  notification.warning({
    placement: "topRight",
    message: "Warning",
    description: message,
  });
}

export function handleLogin(token, redirect) {
  cookie.set("token", token);

  if (!redirect) {
    redirect = "/admin-reservations";
  }

  Router.push(redirect);
}

export function isUnique(array) {
  return new Set(array).size === array.length;
}
