export default function HomeHeader() {
  return (
    <div className="home__header">
      <div className="home__header__title">Twircle</div>
      <div className="home__header__tabs">
        <div className="home__header__tab home__header__tab--active">
          For you
        </div>
        <div className="home__header__tab">Following</div>
      </div>
    </div>
  );
}
