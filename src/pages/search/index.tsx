import styles from "./searchPage.module.scss";
import Loader from "components/loader/Loader";
import PostList from "components/posts/PostList";
import AuthContext from "context/AuthContext";
import { useContext, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { IoMdRefresh } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";

import { useSearchPosts } from "hooks/useSearchPosts";

interface ISearchData {
  search: string;
}

export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [readSearchParams, setSearchParams] = useSearchParams();
  const searchHashTag = readSearchParams.get("q");
  const { user } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ISearchData>();
  const { getSearchPosts, isLoading, posts, setPosts } = useSearchPosts({
    user,
  });

  const onValid = async ({ search }: ISearchData) => {
    await getSearchPosts(search);
    setSearchParams({
      q: search,
    });
    inputRef.current?.blur();
  };

  useEffect(() => {
    if (searchHashTag) {
      (async () => {
        await getSearchPosts(searchHashTag);
        setValue("search", searchHashTag);
      })();
    } else {
      setPosts([]);
      setValue("search", "");
    }
  }, [searchHashTag, getSearchPosts, setValue, setPosts]);

  return (
    <>
      <title>Twircle | Search</title>
      <div className={styles.search}>
        <div className={styles.header}>
          <form className={styles.searchBox} onSubmit={handleSubmit(onValid)}>
            <IoSearch size={18} />
            <input
              {...register("search", { required: "검색어를 입력해주세요." })}
              ref={(el) => {
                register("search").ref(el);
                inputRef.current = el;
              }}
              className={styles.searchInput}
              placeholder={!errors.search ? "Search" : errors.search.message}
              autoComplete="off"
            />
            {searchHashTag && (
              <div
                className={styles.refreshIcon}
                onClick={() => getSearchPosts(searchHashTag)}
              >
                <IoMdRefresh size={20} />
              </div>
            )}
          </form>
        </div>

        <div className="search-post">
          {isLoading ? (
            <Loader />
          ) : (
            <PostList
              posts={posts}
              noPostsMessage={
                searchHashTag && posts.length === 0
                  ? "검색 결과가 없습니다."
                  : "키워드를 검색해보세요."
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
