import Loader from "components/loader/Loader";
import PostList, { IPostProps } from "components/posts/PostList";
import AuthContext from "context/AuthContext";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdRefresh } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { generateKeywords } from "lib/utils";

interface ISearchData {
  search: string;
}

export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [readSearchParams, setSearchParams] = useSearchParams();
  const searchHashTag = readSearchParams.get("q");
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState<IPostProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ISearchData>();

  const getSearchPosts = useCallback(
    async (searchWord: string) => {
      setIsLoading(true);
      const searchArray = generateKeywords(searchWord);
      console.log(searchArray);
      if (user && searchArray.length > 0) {
        const docsRef = collection(db, "posts");
        const searchQuery = query(
          docsRef,
          where("keywords", "array-contains-any", searchArray),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const searchSnapshot = await getDocs(searchQuery);
        const dataObj = searchSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPosts(dataObj as IPostProps[]);
      }
      setIsLoading(false);
    },
    [user]
  );

  const onValid = async ({ search }: ISearchData) => {
    getSearchPosts(search);
    setSearchParams({
      q: search,
    });
    inputRef.current?.blur();
  };

  useEffect(() => {
    if (searchHashTag) {
      getSearchPosts(searchHashTag);
      setValue("search", searchHashTag);
    }
  }, [searchHashTag, getSearchPosts, setValue]);

  return (
    <div className="search">
      <div className="search__header">
        <form className="search__box" onSubmit={handleSubmit(onValid)}>
          <IoSearch size={18} />
          <input
            {...register("search", { required: "검색어를 입력해주세요." })}
            ref={(el) => {
              register("search").ref(el);
              inputRef.current = el;
            }}
            className="search__box__input"
            placeholder={!errors.search ? "Search" : errors.search.message}
            autoComplete="off"
          />
          {searchHashTag && (
            <div
              className="search__box__refresh-icon"
              onClick={() => searchHashTag && getSearchPosts(searchHashTag)}
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
          <>
            <PostList
              posts={posts}
              noPostsMessage={
                searchHashTag
                  ? "검색 결과가 없습니다."
                  : "키워드를 검색해보세요."
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
