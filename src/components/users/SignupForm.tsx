import styles from "./signUpForm.module.scss";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "firebaseApp";
import useSocialSignIn from "hooks/useSocialSignIn";
import { useTranslation } from "hooks/useTranslation";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export const DEFAULT_PROFILE_IMG_URL = "/user.png";
interface ISignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpForm() {
  const { handleSocialSignIn, isLoading, error } = useSocialSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    getValues,
  } = useForm<ISignUpFormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "all",
  });

  const translation = useTranslation();

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

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          bio: "",
          photoURL: user.photoURL,
          photoPath: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      reset();
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

  return (
    <form className={styles.form} onSubmit={handleSubmit(onValid)}>
      <div className={styles.title}>{translation("SIGNUP_TITLE")}</div>
      <div className={styles.block}>
        <label htmlFor="email">{translation("SIGNIN_UP_EMAIL")}</label>
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
      <div className={styles.block}>
        <label htmlFor="password">{translation("SIGNIN_UP_PASSWORD")}</label>
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
            validate: (value) => {
              const confirmPw = getValues("confirmPassword");
              if (confirmPw === "") return true;
              return (
                value === confirmPw || "비밀번호 확인과 일치하지 않습니다."
              );
            },
            deps: ["confirmPassword"],
          })}
        />
        {errors?.password && <span>{errors?.password?.message}</span>}
      </div>
      <div className={styles.block}>
        <label htmlFor="confirmPassword">
          {translation("SIGNUP_CONFIRM_PASSWORD")}
        </label>
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
            validate: (value) => {
              const pw = getValues("password");
              if (pw === "") return true;
              return value === pw || "비밀번호와 일치하지 않습니다.";
            },
            deps: ["password"],
          })}
        />
        {errors?.confirmPassword && (
          <span>{errors?.confirmPassword?.message}</span>
        )}
      </div>
      <div className={styles.block}>
        {translation("SIGNUP_CHECK_ACCOUNT")}
        <Link to="/users/signin" className={styles.form_link}>
          {translation("SIGNUP_GO_TO_SIGNIN")}
        </Link>
      </div>
      <div className={styles.block}>
        <button type="submit" className={styles.btn_submit} disabled={!isValid}>
          {translation("SIGNUP_SUBMIT")}
        </button>
      </div>
      <div className={styles.block}>
        <button
          type="button"
          name="google"
          className={styles.btn_google}
          onClick={handleSocialSignIn}
          disabled={isLoading}
        >
          {translation("SIGNUP_GOOGLE")}
        </button>
      </div>
      <div className={styles.block}>
        <button
          type="button"
          name="github"
          className={styles.btn_github}
          onClick={handleSocialSignIn}
          disabled={isLoading}
        >
          {translation("SIGNUP_GITHUB")}
        </button>
      </div>
      {error && <div className={styles.error_message}>{error.message}</div>}
    </form>
  );
}
