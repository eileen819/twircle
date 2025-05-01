import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "firebaseApp";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const DEFAULT_PROFILE_IMG_URL = "/public/user.png";
interface ISignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<ISignUpFormData>({
    mode: "onChange",
    criteriaMode: "all",
  });

  const navigate = useNavigate();

  const onValid = async ({ email, password }: ISignUpFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: user.email,
        photoURL: DEFAULT_PROFILE_IMG_URL,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        bio: "",
        photoURL: user.photoURL,
        photoPath: "",
        updatedAt: new Date().toLocaleString(),
      });

      reset();
      navigate("/", { replace: true });
      toast.success("성공적으로 회원가입이 되었습니다.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        toast.error(error.message);
      } else {
        toast.error("회원가입 중 오류가 발생했습니다.");
        console.log(error);
      }
    }
  };

  const handleSocialSignIn = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const {
      currentTarget: { name },
    } = event;

    let provider;
    if (name === "google") {
      provider = new GoogleAuthProvider();
    }

    if (name === "github") {
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
        if (!user.displayName || !user.photoURL) {
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
      <div className="form__title">회원가입</div>
      <div className="form__block">
        <label htmlFor="email">이메일</label>
        <input
          type="text"
          id="email"
          autoComplete="off"
          {...register("email", {
            required: "이메일을 입력해주세요.",
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
            required: "비밀번호를 입력해주세요.",
            minLength: {
              value: 8,
              message: "비밀번호는 8자리 이상 입력해주세요.",
            },
          })}
        />
        {errors?.password && <span>{errors?.password?.message}</span>}
      </div>
      <div className="form__block">
        <label htmlFor="confirmPassword">비밀번호 확인</label>
        <input
          type="password"
          id="confirmPassword"
          autoComplete="off"
          {...register("confirmPassword", {
            required: "비밀번호 확인이 필요합니다.",
            minLength: {
              value: 8,
              message: "비밀번호는 8자리 이상 입력해주세요.",
            },
            validate: (value) =>
              value === watch("password") || "비밀번호가 일치하지 않습니다.",
          })}
        />
        {errors?.confirmPassword && (
          <span>{errors?.confirmPassword?.message}</span>
        )}
      </div>
      <div className="form__block">
        계정이 있으신가요?
        <Link to="/users/login" className="form__link">
          로그인하기
        </Link>
      </div>
      <div className="form__block">
        <button type="submit" className="form__btn--submit" disabled={!isValid}>
          회원가입
        </button>
      </div>
      <div className="form__block">
        <button
          type="button"
          name="google"
          className="form__btn--google"
          onClick={handleSocialSignIn}
        >
          Google로 회원가입
        </button>
      </div>
      <div className="form__block">
        <button
          type="button"
          name="github"
          className="form__btn--github"
          onClick={handleSocialSignIn}
        >
          Github으로 회원가입
        </button>
      </div>
    </form>
  );
}
