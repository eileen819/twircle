import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "firebaseApp";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
      await createUserWithEmailAndPassword(auth, email, password);
      reset();
      navigate("/");
      toast.success("성공적으로 회원가입이 되었습니다.");
    } catch (error: any) {
      toast.error(error.code);
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
    </form>
  );
}
