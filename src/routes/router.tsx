import Layout from "components/layout/Layout";
import Home from "pages/home";
import NotificationsPage from "pages/notifications";
import PostsPage from "pages/posts";
import PostDetail from "pages/posts/detail";
import PostEdit from "pages/posts/edit";
import PostsList from "pages/posts/list";
import PostNew from "pages/posts/new";
import PhotoDetail from "pages/posts/photoDetail";
import ProfilePage from "pages/profile";
import ProfileDetail from "pages/profile/detail";
import ProfileEdit from "pages/profile/edit";
import SearchPage from "pages/search";
import SingInPage from "pages/users/signIn";
import SignUpPage from "pages/users/signUp";
import { Navigate, Route, Routes } from "react-router-dom";

interface IRouterProps {
  isAuthenticated: boolean;
}

function Router({ isAuthenticated }: IRouterProps) {
  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="posts" element={<PostsPage />}>
              <Route index element={<PostsList />} />
              <Route path=":id" element={<PostDetail />} />
              <Route path=":id/photo" element={<PhotoDetail />} />
              <Route path="new" element={<PostNew />} />
              <Route path="edit/:id" element={<PostEdit />} />
            </Route>
            <Route path="profile/:uid" element={<ProfilePage />}>
              <Route index element={<ProfileDetail />} />
              <Route path="edit" element={<ProfileEdit />} />
            </Route>
            <Route path="search" element={<SearchPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        </>
      ) : (
        <>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate replace to="/users/signin" />} />
            <Route path="/users/signin" element={<SingInPage />} />
            <Route path="/users/signup" element={<SignUpPage />} />
            <Route path="*" element={<Navigate replace to="/users/signin" />} />
          </Route>
        </>
      )}
    </Routes>
  );
}

export default Router;
