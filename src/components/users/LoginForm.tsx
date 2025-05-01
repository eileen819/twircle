import {
  AuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "firebaseApp";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface ILoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ILoginFormData>({ mode: "onChange", criteriaMode: "all" });

  const onValid = async ({ email, password }: ILoginFormData) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      reset();
      navigate("/", { replace: true });
      toast.success("성공적으로 로그인이 되었습니다.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        toast.error(error.message);
      } else {
        toast.error("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const handleSocialSignIn = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const {
      currentTarget: { name },
    } = event;

    let provider: AuthProvider | undefined;
    if (name === "google") {
      provider = new GoogleAuthProvider();
    } else if (name === "github") {
      provider = new GithubAuthProvider();
    }

    if (!provider) {
      toast.error("지원하지 않는 로그인 방식입니다.");
      return;
    }

    try {
      const result = await signInWithPopup(
        auth,
        provider as GithubAuthProvider | GoogleAuthProvider
      );
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          bio: "",
          photoURL: user.photoURL,
          photoPath: "",
          updatedAt: new Date().toLocaleString(),
        });
        if (!user.displayName) {
          navigate("/profile/edit", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
        toast.success("로그인 되었습니다.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        toast.error(error.message);
      } else {
        toast.error("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <form className="form form--lg" onSubmit={handleSubmit(onValid)}>
      <div className="form__title">로그인</div>
      <div className="form__block">
        <label htmlFor="email">이메일</label>
        <input
          type="text"
          id="email"
          autoComplete="off"
          {...register("email", {
            required: "이메일을 입력해주세요",
            pattern: {
              value:
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
              message: "이메일 형식이 올바르지 않습니다.",
            },
          })}
        />
        {errors?.email && <span>{errors?.email?.message}</span>}
      </div>
      <div className="form__block">
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          autoComplete="off"
          {...register("password", {
            required: "비밀번호를 입력해주세요",
            minLength: {
              value: 8,
              message: "비밀번호는 8자리 이상 입력해주세요.",
            },
          })}
        />
        {errors?.password && <span>{errors?.password?.message}</span>}
      </div>
      <div className="form__block">
        계정이 없으신가요?
        <Link to="/users/signup" className="form__link">
          회원가입하기
        </Link>
      </div>
      <div className="form__block">
        <button type="submit" className="form__btn--submit" disabled={!isValid}>
          로그인
        </button>
      </div>
      <div className="form__block">
        <button
          type="button"
          name="google"
          className="form__btn--google"
          onClick={handleSocialSignIn}
        >
          Google로 로그인
        </button>
      </div>
      <div className="form__block">
        <button
          type="button"
          name="github"
          className="form__btn--github"
          onClick={handleSocialSignIn}
        >
          Github으로 로그인
        </button>
      </div>
    </form>
  );
}
