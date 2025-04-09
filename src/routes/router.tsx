import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "App";
import Home from "pages/home";
import PostsPage from "pages/posts";
import ProfilePage from "pages/profile";
import UsersPage from "pages/users";
import PostDetail from "pages/posts/detail";
import PostNew from "pages/posts/new";
import PostEdit from "pages/posts/edit";
import ProfileEdit from "pages/profile/edit";
import SearchPage from "pages/search";
import ProfileDetail from "pages/profile/detail";
import LoginPage from "pages/users/login";
import SignupPage from "pages/users/signup";
import NotificationsPage from "pages/notifications";
import PostsList from "pages/posts/list";
import { User } from "firebase/auth";

interface ICreateAppRouterProps {
  user: User | null;
}

const createAppRouter = ({ user }: ICreateAppRouterProps) =>
  createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "posts",
          element: <PostsPage />,
          children: [
            {
              path: "",
              element: <PostsList />,
            },
            {
              path: ":id",
              element: <PostDetail />,
            },
            {
              path: "new",
              element: <PostNew />,
            },
            {
              path: "edit/:id",
              element: <PostEdit />,
            },
          ],
        },
        {
          path: "profile",
          element: <ProfilePage />,
          children: [
            {
              path: "",
              element: <ProfileDetail />,
            },
            {
              path: "edit",
              element: <ProfileEdit />,
            },
          ],
        },
        {
          path: "search",
          element: <SearchPage />,
        },
        {
          path: "notifications",
          element: <NotificationsPage />,
        },
        {
          path: "users",
          element: <UsersPage />,
          children: [
            {
              path: "",
              element: <Navigate replace to="login" />,
            },
            {
              path: "login",
              element: <LoginPage />,
            },
            {
              path: "signup",
              element: <SignupPage />,
            },
          ],
        },
        {
          path: "*",
          element: <Navigate replace to="/" />,
        },
      ],
      errorElement: <div>앗! 문제가 발생했어요!</div>,
    },
  ]);

export default createAppRouter;
