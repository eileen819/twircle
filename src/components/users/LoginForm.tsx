import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "firebaseApp";
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
      navigate("/");
      toast.success("성공적으로 로그인이 되었습니다.");
    } catch (error: any) {
      toast.error(error?.code);
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
    </form>
  );
}
