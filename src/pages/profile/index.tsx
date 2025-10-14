import { Outlet } from "react-router-dom";

export default function ProfilePage() {
  return (
    <>
      <title>Twircle | Profile</title>
      <div>
        <Outlet />
      </div>
    </>
  );
}
